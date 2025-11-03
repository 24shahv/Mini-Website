// middleware.js
import { NextResponse } from 'next/server'

export function middleware(req) {
  const blockedIPs = ['203.0.113.5', '45.12.23.9']  // example blocked IPs
  const url = req.nextUrl.clone()

  // 1. Block specific IP addresses
  const ip = req.ip || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')
  if (blockedIPs.includes(ip)) {
    return new NextResponse('Access Denied by Firewall', { status: 403 })
  }

  // 2. Block suspicious query patterns
  if (url.search.includes('DROP') || url.search.includes('SELECT')) {
    return new NextResponse('Suspicious activity detected', { status: 403 })
  }

  // 3. Allow all other requests
  return NextResponse.next()
}
