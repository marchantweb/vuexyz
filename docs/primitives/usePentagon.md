---
category: '@Primitives'
---

<script setup>
    import UsePentagonDemo from '../demo/components/usePentagonDemo.vue';
</script>

# usePentagon

Composable for working with pentagons.

<UsePentagonDemo />

## Configuration

> [!TIP]
> `usePentagon` is an alias for `usePolygon({sides: 5})`. It accepts all the props that `usePolygon` supports, except `sides`.

| Property   | Default          | Description                              |
|:-----------|:-----------------|:-----------------------------------------|
<!--@include: ./shared/polygonprops.md-->

<!--@include: ./shared/config.md-->

## Usage

```ts
import { usePentagon } from 'vuexyz'

const sideLength = ref(50)
const position = ref({ x: 0, y: 0 })
const { vertices, edges, faces } = usePentagon({ sideLength, position })
```

<!--@include: ./shared/return.md-->