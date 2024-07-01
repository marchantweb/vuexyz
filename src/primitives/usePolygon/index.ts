import type {MaybeRefOrGetter} from '@vueuse/shared'
import {computed, toValue} from 'vue'
import type {ComputedRef} from 'vue'
import type {Edge, LineSegment, Vertex} from '../../types'
import {usePrimitive, Primitive, PrimitiveConfig} from '../usePrimitive'

/**
 * Configuration for an irregular polygon by means of passing an array of vertices.
 */
interface VerticesConfig extends Omit<PrimitiveConfig, 'vertices' | 'edges' | 'faces' | 'isClosed'> {
    vertices: MaybeRefOrGetter<MaybeRefOrGetter<Vertex>[]>
}

/**
 * Configuration for a regular polygon by means of passing the number of sides and the length of each side.
 */
interface SidesAndSideLengthConfig extends Omit<PrimitiveConfig, 'vertices' | 'edges' | 'faces' | 'isClosed'> {
    sides: MaybeRefOrGetter<number>
    sideLength?: MaybeRefOrGetter<number>
}

interface SidesAndSizeConfig extends Omit<PrimitiveConfig, 'vertices' | 'edges' | 'faces' | 'isClosed'> {
    sides: MaybeRefOrGetter<number>
    size?: MaybeRefOrGetter<number>
}

/**
 * Configuration for a polygon, union of multiple possible configuration options.
 */
export type PolygonConfig = VerticesConfig | SidesAndSideLengthConfig | SidesAndSizeConfig

/**
 * Composable for working with a polygon.
 *
 * @see https://vuexyz.org/primitives/usepolygon
 */
export function usePolygon(config?: PolygonConfig): Primitive {

    /**
     * Standardize user-provided vertices to ensure they are passed correctly to usePrimitive.
     */
    const standardizeUserVertices = computed(() => {
        if(!!config && "vertices" in config){
            return toValue(config.vertices).map(vertex => toValue(vertex))
        }
        return []
    })

    /**
     * Calculate vertices from sides and sideLength.
     */
    const calculateVerticesFromSidesAndSideLength = () => {

        // Set default values
        const sides = !!config && "sides" in config ? config.sides ?? 4 : 4
        const sideLength = !!config && "sideLength" in config ? config.sideLength ?? 100 : 100

        // Calculate the circumscribed radius of the circle
        const radius: ComputedRef<number> = computed(() => toValue(sideLength) / (2 * Math.sin(Math.PI / toValue(sides))));

        // Calculate the angle step for each side
        const angleStep = computed(() => (Math.PI * 2) / toValue(sides))

        // Define vertices
        return computed(() => {
            const vertices: Vertex[] = []
            let initialRotation: number
            if (toValue(sides) % 2 === 0) {
                initialRotation = -Math.PI / 2 + (angleStep.value / 2)
            } else {
                initialRotation = -Math.PI / 2
            }
            for (let i = 0; i < toValue(sides); i++) {
                vertices.push({
                    x: radius.value * Math.cos(initialRotation + (angleStep.value * i)),
                    y: radius.value * Math.sin(initialRotation + (angleStep.value * i)),
                } as Vertex)
            }
            return vertices
        })
    }

    /**
     * Calculate vertices from sides and width.
     */
    const calculateVerticesFromSidesAndSize = () => {
        // Set default values
        const sides = !!config && "sides" in config ? config.sides ?? 4 : 4
        const size = !!config && "size" in config ? config.size ?? 100 : 100

        // Calculate the radius of the polygon (inscribed in a circle)
        let radius: number = toValue(size) / 2;

        // Calculate the angle step for each side
        const angleStep = computed(() => (Math.PI * 2) / toValue(sides))

        // Define vertices
        return computed(() => {
            const vertices: Vertex[] = [];
            let initialRotation: number
            if (toValue(sides) % 2 === 0) {
                initialRotation = -Math.PI / 2 + (angleStep.value / 2)
            } else {
                initialRotation = -Math.PI / 2
            }
            for (let i = 0; i < toValue(sides); i++) {
                vertices.push({
                    x: radius * Math.cos(initialRotation + (angleStep.value * i)),
                    y: radius * Math.sin(initialRotation + (angleStep.value * i)),
                });
            }
            return vertices;
        })
    }

    // Define vertices (with various possible configurations)
    let vertices: ComputedRef<Vertex[]>;
    if (!!config && "vertices" in config) {
        vertices = standardizeUserVertices;
    } else if (!!config && "size" in config) {
        vertices = calculateVerticesFromSidesAndSize();
    } else {
        vertices = calculateVerticesFromSidesAndSideLength();
    }

    // Define edges
    const edges: ComputedRef<Edge[]> = computed(() => {
        const edges: Edge[] = []
        const vertexCount = vertices.value.length
        for (let i = 0; i < vertexCount; i++) {
            edges.push([{
                type: 'line',
                start: vertices.value[i],
                end: vertices.value[(i + 1) % vertexCount], // Use modulo to loop back to the first vertex
            } as LineSegment] as Edge)
        }
        return edges
    })


    // Define faces
    const faces: ComputedRef<any[]> = computed(() => {
        return [edges.value] // Single face comprised of all edges
    })

    // Return destructured primitive (plus any additional properties, if applicable)
    return {
        ...usePrimitive({...config, vertices, edges, faces})
    }
}
