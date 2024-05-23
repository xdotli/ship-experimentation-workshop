import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  unstable_precompute as precompute,
  unstable_serialize as serialize,
} from "@vercel/flags/next";
import { precomputeFlags } from "./lib/flags";

export const config = {
  matcher: ["/", "/product/:path*", "/cart", "/success"],
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const context = {
    /* pass context on whatever your flag will need */
  };

  // decide precompute flags for the homepage only
  if (request.nextUrl.pathname === "/") {
    const values = await precompute(precomputeFlags, context);
    const code = await serialize(precomputeFlags, values);

    // rewrites the request to the variant for this flag combination
    const nextUrl = new URL(
      `/${code}${request.nextUrl.pathname}${request.nextUrl.search}`,
      request.url
    );
    response = NextResponse.rewrite(nextUrl, { request });
  }

  // set a shopper cookie if one doesn't exist or has been cleared
  if (!request.cookies.has("shopper")) {
    const newShopperId = Math.random().toString(36).substring(2);
    response.cookies.set("shopper", newShopperId);
  }

  return response;
}
