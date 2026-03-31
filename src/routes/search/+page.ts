import type { PageLoad } from './$types';
import { getPosts, getWriteups } from '$lib/utils';

export const load = (async () => {
    const posts = [getPosts(), getWriteups()].flat()
    return { posts };
}) satisfies PageLoad;