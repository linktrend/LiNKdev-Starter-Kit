import { getPage, getPages } from '@/utils/source';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export default async function Page({
  params
}: {
  params: { slug?: string[] };
}) {
  const page = getPage(params.slug);

  if (page == null) {
    notFound();
  }

  return notFound();
}

export async function generateStaticParams() {
  return getPages().map((page: any) => ({
    slug: page.slugs
  }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);

  if (page == null) notFound();

  return {
    title: 'Not Found',
    description: 'Page not found'
  } satisfies Metadata;
}