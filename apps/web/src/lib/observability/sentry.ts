"use client";
import * as Sentry from "@sentry/nextjs";
let inited=false;
export function initSentry(dsn?:string, environment?:string){
  if(inited) return;
  if(!dsn) return;
  Sentry.init({ dsn, environment });
  inited=true;
}
export { Sentry };
