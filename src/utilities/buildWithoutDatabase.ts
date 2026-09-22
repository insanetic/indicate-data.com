/**
 * The production image is built without a database (`BUILD_WITHOUT_DB=true` in the Dockerfile).
 * `generateStaticParams` then returns no paths, so nothing that reads from Payload is prerendered
 * at build time. Every page is rendered on its first request in the running container and cached
 * from there on (ISR); the Payload revalidation hooks keep working as usual.
 *
 * A plain `pnpm build` on a machine with a database still prerenders everything.
 */
export const buildWithoutDatabase = process.env.BUILD_WITHOUT_DB === 'true'
