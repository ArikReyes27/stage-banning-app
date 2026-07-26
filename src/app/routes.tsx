import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CreateRulesetPage } from '../pages/CreateRulesetPage'
import { EditRulesetPage } from '../pages/EditRulesetPage'
import { HomePage } from '../pages/HomePage'
import { RulesetDetailPage } from '../pages/RulesetDetailPage'
import { SessionSetupPage } from '../pages/SessionSetupPage'

type AppRoute =
  | { name: 'home' }
  | { name: 'ruleset-new' }
  | { name: 'ruleset-detail'; rulesetId: string }
  | { name: 'ruleset-edit'; rulesetId: string }
  | { name: 'session-setup'; rulesetId: string }

const readRoute = (): AppRoute => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const sessionSetupMatch = path.match(/^\/session\/setup\/([^/]+)$/)
  const rulesetEditMatch = path.match(/^\/rulesets\/([^/]+)\/edit$/)
  const rulesetMatch = path.match(/^\/rulesets\/([^/]+)$/)

  if (path === '/rulesets/new') {
    return { name: 'ruleset-new' }
  }

  if (sessionSetupMatch) {
    return {
      name: 'session-setup',
      rulesetId: decodeURIComponent(sessionSetupMatch[1]),
    }
  }

  if (rulesetEditMatch) {
    return {
      name: 'ruleset-edit',
      rulesetId: decodeURIComponent(rulesetEditMatch[1]),
    }
  }

  if (rulesetMatch) {
    return {
      name: 'ruleset-detail',
      rulesetId: decodeURIComponent(rulesetMatch[1]),
    }
  }

  return { name: 'home' }
}

export function AppRoutes() {
  const [route, setRoute] = useState<AppRoute>(readRoute)

  useEffect(() => {
    const syncRoute = () => setRoute(readRoute())

    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  const routeKey =
    route.name === 'ruleset-detail' ||
    route.name === 'ruleset-edit' ||
    route.name === 'session-setup'
      ? `${route.name}-${route.rulesetId}`
      : route.name

  const page = (() => {
    if (route.name === 'ruleset-detail') {
      return <RulesetDetailPage rulesetId={route.rulesetId} />
    }

    if (route.name === 'session-setup') {
      return <SessionSetupPage rulesetId={route.rulesetId} />
    }

    if (route.name === 'ruleset-edit') {
      return <EditRulesetPage rulesetId={route.rulesetId} />
    }

    if (route.name === 'ruleset-new') {
      return <CreateRulesetPage />
    }

    return <HomePage />
  })()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {page}
      </motion.div>
    </AnimatePresence>
  )
}
