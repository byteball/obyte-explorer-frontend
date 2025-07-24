import { createResolver, defineNuxtModule, addServerHandler } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'robots'
  },
  setup () {
    const resolver = createResolver(import.meta.url)
    
    addServerHandler({
      route: '/robots.txt',
      handler: resolver.resolve('./runtime/response'),
    })
  }
})
