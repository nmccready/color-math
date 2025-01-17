import expect from "expect"
import * as ColorMath from "../src"

describe("CoreEvaluator", () => {
    const expr = (e, r) => {
        const result = ColorMath.evaluate(e)

        if (result.error)
            throw new Error(result.error)

        if (typeof r === "function")
            expect(r(result.resultStr)).toBeTruthy()
        else
            expect(result.resultStr).toBe(r)
    }

    it("should define colors in different formats", () => {
        expr("#ffcc00", "#ffcc00")
        expr("ffcc00", "#ffcc00")
        expr("#fc0", "#ffcc00")
        expr("fc0", "#ffcc00")
        expr("aquamarine", "#7fffd4")
        expr("skyblue", "#87ceeb")
        expr("tomato", "#ff6347")
        expr("rand", rs => /^#[a-f0-9]{6}$/.test(rs))
        expr("num 33023", "#0080ff")
        expr("t 3500", "#ffc38a")
        expr("wl 560", "#b6ff00")
    })

    it("should define colors using different color models", () => {
        expr("rgb 127 255 212", "#7fffd4")
        expr("rgba 135 206 235 75%", "#87ceebbf")
        expr("argb .7 255 99 71", "#ff6347b3")

        expr("cmyk .43 .12 0 .8", "#1d2d33")
        expr("cmyka 0 .61 .72 0 60%", "#ff634799")
        expr("cmy .5 0 .17", "#80ffd4")
        expr("cmya 0 .61 .72 .65", "#ff6347a6")

        expr("hsl 159.8 100% 75%", "#80ffd4")
        expr("hsla 197 .71 .73 55%", "#89cfeb8c")

        expr("hsv 160 .5 1", "#80ffd4")
        expr("hsb 197 .43 .92", "#86ceeb")
        expr("hsva 9 .72 1 50%", "#ff634780")

        expr("hsi 161 .36 .78", "#7fffd5")
        expr("hsia 196 .30 .75 45%", "#86ceea73")

        expr("lab 92 (-46) 9.7", "#7dffd4")
        expr("laba 79 (-14.8) (-21) 40%", "#87cdea66")

        expr("lch 92 46.5 168", "#7fffd4")
        expr("lcha 79 26 235 35%", "#86cdea59")

        expr("hcl 168 46.5 92", "#7fffd4")
        expr("hcla 235 26 79 35%", "#86cdea59")
    })

    it("should support operations with colors", () => {
        expr("#444 * 2", "#888888")
        expr("skyblue - 0xf", "#78bfdc")

        expr("~red", "#00ffff")

        expr("red | green", "#804000")
        expr("red | {25%} green", "#bf2000")
        expr("red | {25% hsl} green", "#df7000")
        expr("red | {hsl} green", "#bfc000")

        expr("hotpink << 50%", "#d28aa9")
        expr("rgb 165 42 42 >> .2", "#b10f21")
        expr("temp 4000 <<< 30%", "#b48a61")
        expr("#fc0 >>> 70%", "#ffffc9")

        expr("pink %% hotpink", "1.7215")
        expr("pink %% purple", "6.1242")
    })

    it("should support blending colors", () => {
        expr("#222 + #444", "#666666")
        expr("#ccc - #111", "#bbbbbb")
        expr("#ff6600 * #ccc", "#cc5200")
        expr("#222 / #444", "#808080")
        expr("skyblue <<< tomato", "#876347")
        expr("skyblue >>> tomato", "#ffceeb")
        expr("#ff6600 !* #00ff00", "#ffff00")
        expr("#ff6600 ** #999", "#ff7a00")
        expr("olive <* pink", "#ffc097")
        expr("olive *> pink", "#bfa000")
        expr("ffcc00 ^* ccc", "#3300cc")
        expr("ffcc00 ^^ ccc", "#3352cc")
        expr("ffcc00 !^ ccc", "#3366cc")
        expr("indigo << red", "#4b0000")
        expr("indigo >> red", "#ff0082")
    })

    it("should support operations with color channels", () => {
        expr("brown @red", "165")
        expr("#ffcc00 @g", "204")
        expr("t 5000 @cmyk.y", "0.1959")
        expr("olive @a", "1")

        expr("aquamarine @a = .3", "#7fffd44d")
        expr("rgb 5 7 9 @hsl.h 90", "#070905")
        expr("#000 @lightness 50%", "#808080")

        expr("red @a /= 2", "#ff000080")
        expr("ffcc00 @rgb.r -= 50", "#cdcc00")
        expr("tomato @s *= 30%", "#bf9087")

        expr("olive @n", "8421376")

        expr("fff @n 0", "#000000")
        expr("#0080ff @n /= 2", "#00407f")

        expr("#ffe3cd @t", "4999")

        expr("red @t 3500", "#ffc38a")
        expr("ffe3cd @t += 500", "#ffecdf")
    })

    it("should support operations with color scales", () => {
        expr("scale (red 0f0 blue) -> 10", "[#ff0000, #c63800, #8d7100, #55aa00, #1ce200, #00e21c, #00aa54, #00718d, #0038c6, #0000ff]")
        expr("scale (yellow 008ae5) -> 10", "[#ffff00, #e2f219, #c6e532, #aad84c, #8dcb65, #71be7f, #55b198, #38a4b2, #1c97cb, #008ae5]")
        expr("scale (t 2000 t 6000) -> 10", "[#ff8a13, #ff962c, #ffa144, #ffad5c, #ffb975, #ffc48d, #ffd0a6, #ffdbbe, #ffe7d6, #fff3ef]")
        expr("bezier (ff0 red #000) -> 10", "[#ffff00, #ffd700, #f9b200, #e78e03, #ce6d09, #af500d, #8a370e, #61240e, #371508, #000000]")
        expr("bezier (red 0f0) -> 10", "[#ff0000, #f64e00, #eb7000, #df8a00, #d1a000, #c0b500, #abc900, #90db00, #6aed00, #00ff00]")

        expr("scale (red:.2 0f0:50%) -> 10", "[#ff0000, #e21c00, #c63800, #aa5400, #8d7100, #718d00, #54aa00, #38c600, #1ce200, #00ff00]")
        expr("scale (red 0f0) @domain (.2 .5) -> 10", "[#ff0000, #e21c00, #c63800, #aa5400, #8d7100, #718d00, #54aa00, #38c600, #1ce200, #00ff00]")
        expr("scale (red 0f0) @pad .25 -> 10", "[#bf3f00, #b14d00, #a25c00, #946a00, #867800, #788600, #6a9400, #5ca200, #4db100, #3fbf00]")
        expr("bezier (red 0f0) @pad (.1 .3) -> 10", "[#f74a00, #f16000, #ea7200, #e38200, #db9100, #d29e00, #c9ab00, #beb700, #b2c300, #a4ce00]")

        expr("cubehelix @pad (0 .2) -> 10", "[#000000, #18112a, #17324b, #175949, #367434, #767a33, #b5785e, #d382a4, #cda1df, #c1caf3]")
        expr("cubehelix @start 200 -> 10", "[#000000, #062818, #2e450f, #784a2a, #a7537c, #9c7bc8, #86b4d4, #a0dbbe, #dceacb, #ffffff]")
        expr("cubehelix @rot (-.5) -> 10", "[#000000, #29122f, #432b61, #504c8c, #5972ab, #6698bd, #7cbcc5, #9fd8cd, #cceede, #ffffff]")
        expr("cubehelix @hue .5 -> 10", "[#000000, #1b1a28, #263f43, #406247, #737552, #a7837e, #be9cb7, #c4c3dc, #d8e6e8, #ffffff]")
        expr("cubehelix @hue (1 0) -> 10", "[#000000, #1a1932, #1c4349, #396642, #73764e, #a4847f, #b7a1b3, #c5c4cf, #e0e3e4, #ffffff]")
        expr("cubehelix @gamma .7 -> 10", "[#000000, #333061, #2a6b75, #479356, #959952, #d7968c, #e2a9d7, #d3d0f7, #dbf0f3, #ffffff]")
        expr("cubehelix @lt (.3 .8) -> 10", "[#733366, #565294, #367c87, #489457, #898e46, #c57f74, #cd85be, #aba7e5, #96cdd5, #aedeb7]")
        expr("cubehelix @start 200 @rot .5 @gamma .8 @lt (.3 .8) -> 10", "[#3b6c8e, #5770a9, #7873bc, #9978c5, #b77ec6, #cf89c1, #df97ba, #e8a8b4, #ebbbb4, #ebcfba]")

        expr("+scale (black red yellow) -> 10", "[#000000, #440000, #6f0000, #9d0000, #cf0000, #ff1800, #ff7300, #ffa700, #ffd400, #ffff00]")
        expr("+bezier (yellow 0f0 blue) -> 10", "[#ffff00, #c3f436, #aade59, #9ec776, #95ad8e, #8d93a6, #8178bc, #715bd3, #563ce8, #0000ff]")
    })

    it("should support operations with numbers", () => {
        expr("0b01101001", "105")
        expr("0o151", "105")
        expr("105", "105")
        expr("0x69", "105")
        expr("55%", "0.55")
        expr("5 + 10", "15")
        expr("-360 * 0.5 + (100 - 40)", "-120")
        expr("0xf / 0b1010", "1.5")
        expr("2 ^ 14", "16384")
        expr("4 ^ (2 / 4)", "2")
    })

    it("should support list definition", () => {
        expr("red 0f0 blue", "[#ff0000, #00ff00, #0000ff]")
        expr("(pink >> .5) gold", "[#ffb6c8, #ffd700]")
    })

    it("should support brewer constants", () => {
        expr("YlOrBr", "[#ffffe5, #fff7bc, #fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506]")
        expr("PRGn", "[#40004b, #762a83, #9970ab, #c2a5cf, #e7d4e8, #f7f7f7, #d9f0d3, #a6dba0, #5aae61, #1b7837, #00441b]")
    })

    it("should support variables and statements", () => {
        expr("$col = rgb 255 204 0", "#ffcc00")
        expr("$num = 2^8 - 1", "255")
        expr("$lst = #444 #888", "[#444444, #888888]")
        expr("$my = yellow black; bezier $my -> 10", "[#ffff00, #e0df11, #c1c018, #a3a21b, #86851b, #6b691a, #504e17, #373514, #1f1e0d, #000000]")
    })
})
