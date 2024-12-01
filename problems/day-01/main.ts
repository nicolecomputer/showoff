import { readFileSync } from "fs";

// Generic Utilities
function zip<T>(arr1: T[], arr2: T[]): [T, T][] {
    return arr1.map((item, index) => [item, arr2[index]]);
}

function sum(total: number, entry: number): number {
    return total + entry
}

function solve<T>(inputFile: string, solution: (input: string) => T): T {
    const data = readFileSync(inputFile, "utf-8").trim()
    const solved = solution(data)
    return solved
}

// Functions for this problem
export function distance(a: number, b: number): number {
    return Math.abs(a - b)
}

function parseNumbers(line: string): number[] {
    return line.split(/\s+/).map(num => parseInt(num))
}

function buildLists(prevLists: [number[], number[]], numbers: number[]): [number[], number[]] {
    const [first, second] = numbers
    return [
        [...prevLists[0], first],
        [...prevLists[1], second]
    ]
}

export function parseLists(input: string): [number[], number[]] {
    return input.trim().split("\n").map(parseNumbers).reduce(buildLists, [[], []])
}

// Solutions
export function part1(input: string): number {
    let [list1, list2] = parseLists(input);

    list1.sort()
    list2.sort()

    return zip(list1, list2).map(([a, b]) => distance(a, b)).reduce(sum)
}

// Part 2

function entryCount(value: number, otherList: number[]): number {
    return otherList.filter(v => v == value).length
}

export function part2(input: string): number {
    let [list1, list2] = parseLists(input);

    return list1.map(i => i * entryCount(i, list2)).reduce(sum)
}

console.log("Part 1: ", solve("src/day-01/input.txt", part1)) //?
console.log("Part 2: ", solve("src/day-01/input.txt", part2)) //?
