import {
  type VNode,
  type IntrinsicElementAttributes,
  type PropType,
  defineComponent,
  mergeProps,
  cloneVNode,
  h,
  Fragment,
  Comment
} from "vue";

export type DOMElements = keyof IntrinsicElementAttributes

export type ElementType = Parameters<typeof h>[0]

export const STRICT_VOID_TAGS: string[] = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]


export const renderSlotFragments = (children?: VNode[]): VNode[] => {
  if (!children) return []

  return children.flatMap((child) => {
    if (child.type === Fragment)
      return renderSlotFragments(child.children as VNode[])

    return [child]
  })
}

export const Slot = defineComponent({
  name: 'Slot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      if (!slots.default) return null;

      const childrens = renderSlotFragments(slots.default());

      const firstNonCommentChildrenIndex = childrens.findIndex(child => child.type !== Comment);
      if (firstNonCommentChildrenIndex === -1) return childrens;

      const firstNonCommentChildren = childrens[firstNonCommentChildrenIndex];

      delete firstNonCommentChildren.props?.ref

      const mergedProps = firstNonCommentChildren.props
        ? mergeProps(attrs, firstNonCommentChildren.props)
        : attrs
      if (firstNonCommentChildren.props?.class)
        delete firstNonCommentChildren.props.class
      
      const cloned = cloneVNode(firstNonCommentChildren, mergedProps)

      for (const prop in mergedProps) {
        if (prop.startsWith('on')) {
          cloned.props ||= {}
          cloned.props[prop] = mergedProps[prop]
        }
      }

      if (childrens.length === 1)
        return cloned

      childrens[firstNonCommentChildrenIndex] = cloned
      return childrens;
    }
  }
})

export const Primitive = defineComponent({
  name: 'Primitive',
  inheritAttrs: false,
  props: {
    asChild: {
      type: Boolean,
      default: false,
    },
    as: {
      type: [String, Object] as PropType<ElementType>,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const asTag = props.asChild ? 'template' : props.as
    if (typeof asTag === 'string' && STRICT_VOID_TAGS.includes(asTag))
      return () => h(asTag, attrs)

    if (asTag !== 'template')
      return () => h(props.as, attrs, { default: slots.default })

    return () => h(Slot, attrs, { default: slots.default })
  }
})