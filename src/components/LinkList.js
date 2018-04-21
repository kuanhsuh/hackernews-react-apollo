import React, { Component } from 'react'
import Link from './Link'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import {LINKS_PER_PAGE} from '../constants'

class LinkList extends Component {
  _updateCacheAfterVote = (store, createVote, linkId) => {
    // 1
    const data = store.readQuery({ query: FEED_QUERY })
    console.log('createvote', createVote)
    // 2
    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
  
    // 3
    store.writeQuery({ query: FEED_QUERY, data })
  }

  _getLinksToRender = (isNewPage) => {
    if (isNewPage) {
      return this.props.feedQuery.feed.links
    }
    const rankedLinks = this.props.feedQuery.feed.links.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    return rankedLinks
  }

  _nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page <= this.props.feedQuery.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }
  
  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
  }

  render() {

    // const linksToRender = [
    //   {
    //     id: '1',
    //     description: 'Prisma turns your database into a GraphQL API 😎 😎',
    //     url: 'https://www.prismagraphql.com',
    //   },
    //   {
    //     id: '2',
    //     description: 'The best GraphQL client',
    //     url: 'https://www.apollographql.com/docs/react/',
    //   },
    // ]

    // 1
    if (this.props.feedQuery && this.props.feedQuery.loading) {
        return <div>Loading</div>
    }

    // 2
    if (this.props.feedQuery && this.props.feedQuery.error) {
        return <div>Error</div>
    }

    // 3
    // const linksToRender = this.props.feedQuery.feed.links
    const isNewPage = this.props.location.pathname.includes('new')
    const linksToRender = this._getLinksToRender(isNewPage)
    const page = parseInt(this.props.match.params.page, 10)
    return (
      <div>
      <div>
        {linksToRender.map((link, index) => (
          <Link
          key={link.id}
          updateStoreAfterVote={this._updateCacheAfterVote}
          index={index}
          link={link} />
        ))}
        </div>
        {isNewPage &&
        <div className='flex ml4 mv3 gray'>
          <div className='pointer mr2' onClick={() => this._previousPage()}>Previous</div>
          <div className='pointer' onClick={() => this._nextPage()}>Next</div>
        </div>
        }
      </div>
    )
  }
}

// 1
// export const FEED_QUERY = gql`
//   query FeedQuery {
//     feed {
//       links {
//         id
//         createdAt
//         url
//         description
//         postedBy {
//           id
//           name
//         }
//         votes {
//           id
//           user {
//             id
//           }
//         }
//       }
//     }
//   }
// `
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`

// 3
// export default graphql(FEED_QUERY, { name: 'feedQuery' }) (LinkList)
export default graphql(FEED_QUERY, {
  name: 'feedQuery',
  options: ownProps => {
    const page = parseInt(ownProps.match.params.page, 10)
    const isNewPage = ownProps.location.pathname.includes('new')
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {
      variables: { first, skip, orderBy },
    }
  },
})(LinkList)