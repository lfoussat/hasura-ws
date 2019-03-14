const get = _ => Object.values(_)[0]
const getAll = _ => _
const getOne = _ => Object.values(_)[0][0]
export const prepare = ({ runFromString, subscribeFromString }, query) => {
  const payload = JSON.stringify({ query })
  const noVars = payload
  const base = payload.slice(0, -1)
  const build = variables => {
    if (!variables) return noVars
    if (typeof variables === 'function') {
      throw Error(
        'variables should not be functions, verify the order of your parameters',
      )
    }
    const stringified = JSON.stringify(variables)
    if (stringified === '{}') return noVars
    return `${base},"variables":${stringified}}`
  }
  const map = query.test(/^\s*subscription\s/)
    ? mapper => (sub, variables) =>
        exec(value => sub(mapper(variables)), build(variables))
    : mapper => async variables => mapper(await exec(build(variables)))

  const run = map(get)
  run.all = map(getAll)
  run.one = map(getOne)
  run.map = map
  run.query = query
  return run
}

export const initPrepare = client => query => prepare(client, query)
