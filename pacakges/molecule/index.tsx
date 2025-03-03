import {
  type ComponentOptions,
  type VNode,
  defineComponent,
  Fragment,
  Comment
} from "vue";

export const createComponent = (
  name: string,
  options: ComponentOptions
) => defineComponent({
  name,
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
  setup(_, { slots }) {
    return () => {
      if (!slots.default) return null;

      const childrens = renderSlotFragments(slots.default());

      const firstNonCommentChildrenIndex = childrens.findIndex(child => child.type !== Comment);
      if (firstNonCommentChildrenIndex === -1) return childrens;

      const firstNonCommentChildren = childrens[firstNonCommentChildrenIndex];
      console.log(firstNonCommentChildren, "firstNonCommentChildren")

      return childrens;
    }
  }
})