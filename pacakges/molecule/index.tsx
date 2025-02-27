import { type VNode, cloneVNode, defineComponent, Fragment, mergeProps, h, ComponentPublicInstance, type AllowedComponentProps, type ComponentCustomProps, type VNodeProps, type ExtractPropTypes, type IntrinsicElementAttributes } from "vue";

type ElementType = Parameters<typeof h>[0]

export interface PolymorphicProps {
  tag?: boolean
}

export type AsChildComponent<
  Component extends ElementType,
  P extends Record<string, unknown> = Record<never, never>,
> = {
  new(): {
    $props: AllowedComponentProps &
    ComponentCustomProps &
    VNodeProps &
    ExtractPropTypes<Component> &
    (Component extends keyof IntrinsicElementAttributes
      ? IntrinsicElementAttributes[Component]
      : Record<never, never>) &
    P &
    PolymorphicProps
  }
}

class A {
  _props: { a: number }
  public constructor() { }
}

const a:Te = A

type Te = {
  new(): {
    _props: { a: number }
  }
}


function renderSlotFragments(children?: VNode[]): VNode[] {
  if (!children) return []
  return children.flatMap((child) => {
    if (child.type === Fragment) return renderSlotFragments(child.children as VNode[])

    return [child]
  })
}

export const Dynamic = defineComponent({
  name: "Dynamic",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      if (!slots.default) return null

      const children = renderSlotFragments(slots.default())
      console.log(children, "children")
      const [firstChildren] = children

      if (Object.keys(attrs).length > 0) {
        const mergedProps = mergeProps(attrs, {})
        const cloned = cloneVNode(firstChildren, mergedProps)

        return cloned;
      }

      return children;
    }
  }
})

export const TagProps = {
  tag: {
    type: Boolean,
    default: false
  }
}

export const withTag = (component: ElementType) => defineComponent({
  name: 'Polymorphic',
  inheritAttrs: false,
  props: TagProps,
  setup(props, { attrs, slots }) {
    if (!props.tag) return () => h(component, { ...attrs }, slots.default?.())
    return () => h(Dynamic, attrs, { default: slots.default })
  }
})
type DOMElements = keyof IntrinsicElementAttributes
export type HTMLPolymorphicComponents = {
  [E in DOMElements]: AsChildComponent<E>
}

export const useFactory = () => {
  const cache = new Map();

  const factory = new Proxy(withTag, {
    apply(_, __, [component]) {
      console.log(2323)
      return withTag(component)
    },
    get(_, element) {
      const component = element as unknown as ElementType
      console.log(withTag(component),A)
      if (!cache.has(component)) {
        cache.set(component, withTag(component))
      }
      return cache.get(component)
    },
  }) as unknown as HTMLPolymorphicComponents

  return factory;
}

export const mol = useFactory()