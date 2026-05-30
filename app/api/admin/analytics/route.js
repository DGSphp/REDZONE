import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const CF_GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';

async function cfQuery(query, variables, apiToken) {
  const res = await fetch(CF_GRAPHQL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudflare API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { env } = getCloudflareContext();
    const apiToken = process.env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID || env.CLOUDFLARE_ZONE_ID;

    if (!apiToken || !zoneId) {
      return NextResponse.json({
        error: 'Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID. Add them as wrangler secrets.',
        configured: false,
      }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = parseInt(searchParams.get('days') || '30', 10);
    const days = Math.min(Math.max(isNaN(parsed) ? 30 : parsed, 1), 90);

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    // Run all queries in parallel
    const [dailyRes, countryRes, pathsRes] = await Promise.all([
      // Daily traffic over time
      cfQuery(`
        query DailyTraffic($zoneTag: string!, $start: Date!, $end: Date!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                filter: { date_geq: $start, date_leq: $end }
                orderBy: [date_ASC]
                limit: 90
              ) {
                dimensions { date: datetimeDay }
                sum { requests pageViews bytes cachedRequests }
                uniq { uniques }
              }
            }
          }
        }
      `, { zoneTag: zoneId, start: startDate, end: endDate }, apiToken),

      // Country breakdown (aggregate for period)
      cfQuery(`
        query CountryBreakdown($zoneTag: string!, $start: Date!, $end: Date!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                filter: { date_geq: $start, date_leq: $end }
                limit: 1
              ) {
                sum {
                  countryMap {
                    clientCountryName
                    requests
                  }
                  browserMap {
                    uaBrowserFamily
                    pageViews
                  }
                  responseStatusMap {
                    edgeResponseStatus
                    requests
                  }
                }
              }
            }
          }
        }
      `, { zoneTag: zoneId, start: startDate, end: endDate }, apiToken),

      // Top paths (adaptive/sampled)
      cfQuery(`
        query TopPaths($zoneTag: string!, $start: DateTime!, $end: DateTime!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequestsAdaptiveGroups(
                filter: { datetime_geq: $start, datetime_leq: $end }
                limit: 20
                orderBy: [count_DESC]
              ) {
                count
                dimensions {
                  clientRequestPath
                  clientDeviceType
                }
              }
            }
          }
        }
      `, {
        zoneTag: zoneId,
        start: start.toISOString(),
        end: end.toISOString(),
      }, apiToken),
    ]);

    // Parse daily traffic
    const dailyData = dailyRes.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
    const daily = dailyData.map(d => ({
      date: d.dimensions.date,
      requests: d.sum.requests,
      pageViews: d.sum.pageViews,
      visitors: d.uniq.uniques,
      bytes: d.sum.bytes,
      cachedRequests: d.sum.cachedRequests,
    }));

    // Totals
    const totals = daily.reduce((acc, d) => ({
      requests: acc.requests + d.requests,
      pageViews: acc.pageViews + d.pageViews,
      visitors: acc.visitors + d.visitors,
      bytes: acc.bytes + d.bytes,
    }), { requests: 0, pageViews: 0, visitors: 0, bytes: 0 });

    // Parse country data
    const countryRaw = countryRes.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
    const countries = [];
    const browsers = [];
    const statusCodes = [];
    for (const group of countryRaw) {
      if (group.sum.countryMap) {
        for (const c of group.sum.countryMap) {
          const existing = countries.find(x => x.country === c.clientCountryName);
          if (existing) existing.requests += c.requests;
          else countries.push({ country: c.clientCountryName, requests: c.requests });
        }
      }
      if (group.sum.browserMap) {
        for (const b of group.sum.browserMap) {
          const existing = browsers.find(x => x.browser === b.uaBrowserFamily);
          if (existing) existing.pageViews += b.pageViews;
          else browsers.push({ browser: b.uaBrowserFamily, pageViews: b.pageViews });
        }
      }
      if (group.sum.responseStatusMap) {
        for (const s of group.sum.responseStatusMap) {
          const existing = statusCodes.find(x => x.status === s.edgeResponseStatus);
          if (existing) existing.requests += s.requests;
          else statusCodes.push({ status: s.edgeResponseStatus, requests: s.requests });
        }
      }
    }
    countries.sort((a, b) => b.requests - a.requests);
    browsers.sort((a, b) => b.pageViews - a.pageViews);
    statusCodes.sort((a, b) => b.requests - a.requests);

    // Parse top paths + device types
    const pathsRaw = pathsRes.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];
    const pathMap = {};
    const deviceMap = {};
    for (const p of pathsRaw) {
      const path = p.dimensions.clientRequestPath;
      const device = p.dimensions.clientDeviceType;
      if (path) {
        pathMap[path] = (pathMap[path] || 0) + p.count;
      }
      if (device) {
        deviceMap[device] = (deviceMap[device] || 0) + p.count;
      }
    }
    const topPaths = Object.entries(pathMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    const devices = Object.entries(deviceMap)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      configured: true,
      period: { start: startDate, end: endDate, days },
      totals,
      daily,
      countries: countries.slice(0, 20),
      browsers: browsers.slice(0, 10),
      statusCodes: statusCodes.slice(0, 10),
      topPaths,
      devices,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
