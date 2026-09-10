import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'fm80bgv3',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
    appId: 'n29681pkdvx180vrjstee327',
  },
  typegen: {
    enabled: true,
    path: './src/**/*.{ts,tsx,js,jsx}',
    schema: './schema.json',
    generates: './sanity.types.ts',
    overloadClientMethods: true,
  },
})
