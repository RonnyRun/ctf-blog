import type { PageLoad } from './$types';
import { getWriteups } from '$lib/utils';

export const load = (async () => {
    return { posts: getWriteups() };
}) satisfies PageLoad;