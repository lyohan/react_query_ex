import { Model, Server } from 'miragejs'
import challenges from './challenges.json'

function paginate(array, pageSize, pageNumber) {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
}

const parseFilters = (filters) => {
  if (!filters) {
    return {}
  }

  return filters.split(',').reduce((result, filter) => {
    try {
      const [key, ...values] = filter.split(':')
      if (key && values) {
        result[key] = values.join(', ')
      }
    } catch (err) {
      //
    }
    return result
  }, {})
}

const parseSort = (sort) => {
  if (!sort) {
    return {
      key: 'id',
      descending: true,
    }
  }

  const result = {}
  try {
    const [key, ...values] = sort.split(':')
    if (key && values) {
      result.key = key
      result.descending = values.join('').toLowerCase() === 'desc'
    }
  } catch (err) {
    //
  }

  return result
}

const getFilteredChallenges = (challenges, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return challenges
  }

  return challenges
}

const getSortedChallenges = (challenges, sort) => {
  if (!sort || Object.keys(sort).length === 0) {
    return challenges
  }

  return challenges.sort((a, b) => {
    const direction = sort.descending ? -1 : 1
    if (sort.key === 'id') {
      if (a.id === b.id) {
        return 0
      }

      return direction * (Number(a.id) > Number(b.id) ? 1 : -1)
    } else if (sort.key === 'title') {
      if (a.title === b.title) {
        return 0
      }

      return direction * (a.title > b.title ? 1 : -1)
    }

    return 0
  })
}

export const challengesServer = ({ environment = 'development' } = {}) => {
  const server = new Server({
    environment,
    models: {
      challenges: Model.extend({}),
    },
    seeds(server) {
      server.db.loadData({
        challenges: challenges,
      })
    },
    routes() {
      this.namespace = 'admin'
      this.get('/challenges', (schema, request) => {
        const { page = 1, per_page: per_page = 10 } = request.queryParams
        const filters = parseFilters(request.queryParams.filters)
        const sort = parseSort(request.queryParams.sort)
        const pageNumber = Number(page)
        const pageSize = Number(per_page)
        const items = schema.all('challenges').models
        const filteredItems = getFilteredChallenges(items, filters)
        const sortedItems = getSortedChallenges(filteredItems, sort)
        const totalCount = sortedItems.length
        const totalPage = Math.ceil(totalCount / pageSize)

        return {
          data: paginate(sortedItems, pageSize, pageNumber),
          pagination: {
            page: pageNumber,
            per_page: pageSize,
            total: totalCount,
            total_page: totalPage,
          },
        }
      })

      this.passthrough()
    },
  })

  return server
}
