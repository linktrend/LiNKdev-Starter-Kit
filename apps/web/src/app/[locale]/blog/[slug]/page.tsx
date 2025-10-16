import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { blog } from '@/utils/source';
import { createMetadata } from '@/utils/metadata';
import { buttonVariants } from '@starter/ui';
import { Control } from './page.client';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';

interface Param {
  slug: string;
}

export const dynamicParams = false;

export default function Page({
  params
}: {
  params: Param;
}): React.ReactElement {
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  return notFound();
}

export function generateMetadata({ params }: { params: Param }): Metadata {
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  return createMetadata({
    title: 'Not Found',
    description: 'Page not found'
  });
}

export async function generateStaticParams(): Promise<Param[]> {
  return blog.getPages().map((page: any) => ({
    slug: page.slugs[0]
  }));
}
