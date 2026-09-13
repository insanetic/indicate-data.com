import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedHeadingNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'
import { HeadingIds, nodeText } from '@/utilities/lexical/headings'
import { RichTextLink } from './Link'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  if (relationTo === 'posts') return `/posts/${slug}`
  return slug === 'home' ? '/' : `/${slug}`
}

const makeConverters =
  (ids?: HeadingIds, copyLabel = 'Link zu diesem Abschnitt'): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => {
    const linkConverters = LinkJSXConverter({ internalDocToHref })
    return {
      ...defaultConverters,
      ...linkConverters,
      ...(ids
        ? {
            heading: ({
              node,
              nodesToJSX,
            }: {
              node: SerializedHeadingNode
              nodesToJSX: (a: { nodes: SerializedHeadingNode['children'] }) => React.ReactNode
            }) => {
              const Tag = node.tag
              const id = ids.next(nodeText(node as never).trim())
              return (
                <Tag className="group/heading scroll-mt-28" id={id}>
                  {nodesToJSX({ nodes: node.children })}
                  <a aria-label={copyLabel} className="heading-anchor" href={`#${id}`}>
                    #
                  </a>
                </Tag>
              )
            },
          }
        : {}),
      // Internal links get the current locale prefix on the client.
      link: ({ node, nodesToJSX }) => {
        const fields = node.fields
        const href =
          fields.linkType === 'internal' ? internalDocToHref({ linkNode: node }) : fields.url || ''
        return (
          <RichTextLink href={href} newTab={Boolean(fields.newTab)}>
            {nodesToJSX({ nodes: node.children })}
          </RichTextLink>
        )
      },
      blocks: {
        banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
        mediaBlock: ({ node }) => (
          <MediaBlock
            className="col-start-1 col-span-3"
            imgClassName="m-0"
            {...node.fields}
            captionClassName="mx-auto max-w-[48rem]"
            enableGutter={false}
            disableInnerContainer={true}
          />
        ),
        code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
        cta: ({ node }) => <CallToActionBlock {...node.fields} />,
      },
    }
  }

const jsxConverters = makeConverters()

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  /** Give headings ids (and a hover anchor) so a table of contents can link to them. */
  headingIds?: boolean
  copyLinkLabel?: string
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    headingIds = false,
    copyLinkLabel,
    ...rest
  } = props
  const converters = headingIds ? makeConverters(new HeadingIds(), copyLinkLabel) : jsxConverters
  return (
    <ConvertRichText
      converters={converters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
