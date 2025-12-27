export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    if (error instanceof Error) {
      const e = new Error(error.message)
      e.stack = error.stack || '';
      useBugsnag().notify(e);
    }
  }

  // Also possible
  nuxtApp.hook('vue:error', (error, instance, info) => {
    console.error(error);
    if (error instanceof Error) {
      const e = new Error(error.message)
      e.stack = error.stack || '';
      useBugsnag().notify(e);
    }
  })
})
