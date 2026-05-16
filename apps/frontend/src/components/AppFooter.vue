<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

const { t } = useI18n();
const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-auto border-t border-border bg-card">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6">

        <!-- Brand -->
        <RouterLink to="/blog" class="flex items-center gap-2 shrink-0 group">
          <div class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center transition-opacity group-hover:opacity-80">
            <span class="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <span class="font-semibold text-sm text-foreground">Blogs</span>
        </RouterLink>

        <!-- Nav links -->
        <nav class="flex items-center gap-5 text-sm text-muted-foreground">
          <RouterLink
            to="/blog"
            class="transition-colors hover:text-foreground"
            active-class="text-foreground font-medium"
          >
            {{ t('nav.blog') }}
          </RouterLink>
          <RouterLink
            to="/me/posts"
            class="transition-colors hover:text-foreground"
            active-class="text-foreground font-medium"
          >
            {{ t('nav.myPosts') }}
          </RouterLink>
          <RouterLink
            to="/me/bookmarks"
            class="transition-colors hover:text-foreground"
            active-class="text-foreground font-medium"
          >
            {{ t('nav.bookmarks') }}
          </RouterLink>
        </nav>

        <!-- Copyright -->
        <p class="text-xs text-muted-foreground shrink-0">
          &copy; {{ year }} Blogs. {{ t('footer.rights') }}
        </p>

      </div>
    </div>
  </footer>
</template>
