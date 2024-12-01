import { distance, parseLists, part1, part2 } from "./main";

describe("Day 01", () => {
    describe("distance", () => {
        it('checks distances', () => {
            expect(distance(1, 3)).toBe(2);
            expect(distance(2, 3)).toBe(1);
            expect(distance(3, 3)).toBe(0);
            expect(distance(3, 4)).toBe(1);
            expect(distance(3, 5)).toBe(2);
            expect(distance(4, 9)).toBe(5);
        })
    })

    describe("parseLists", () => {
        it('parses lists', () => {
            const result = parseLists(`3   4
4   3
2   5
1   3
3   9
3   3`)

            const [list1, list2] = result;
            expect(list1).toEqual([3, 4, 2, 1, 3, 3])
            expect(list2).toEqual([4, 3, 5, 3, 9, 3])
        })
    })

    describe("part1", () => {
        it('solves the problem', () => {
            const solution = part1(`3   4
4   3
2   5
1   3
3   9
3   3`)
            expect(solution).toBe(11);
        });
    })

    describe("part2", () => {
        it('solves the problem', () => {
            const solution = part2(`3   4
4   3
2   5
1   3
3   9
3   3`)
            expect(solution).toBe(31);
        });
    })
})
