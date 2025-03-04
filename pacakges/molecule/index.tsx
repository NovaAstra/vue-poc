import {
  type ComponentOptions,
  type VNode,
  defineComponent,
  mergeProps,
  cloneVNode,
  Fragment,
  Comment
} from "vue";

export const createComponent = (
  name: string,
  options: ComponentOptions
) => defineComponent({
  name: name,
  ...options
})

export const renderSlotFragments = (children?: VNode[]): VNode[] => {
  if (!children) return []

  return children.flatMap((child) => {
    if (child.type === Fragment)
      return renderSlotFragments(child.children as VNode[])

    return [child]
  })
}

export const Slot = createComponent('Slot', {
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