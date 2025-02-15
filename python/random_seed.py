def js_left_shift(value, shift):
    result = (value << shift) & 0xFFFFFFFF
    if result >= 0x80000000:
        result -= 0x100000000
    return result

def js_unsigned_right_shift(value, shift):
    return (value & 0xFFFFFFFF) >> shift

class RandomSeed:
    def __init__(self, seed=88675123):
        self.x = 123456789
        self.y = 362436069
        self.z = 521288629
        self.w = seed

    def generate(self, min, max):
        t = self.x ^ js_left_shift(self.x, 11)
        print(t)
        self.x = self.y
        self.y = self.z
        self.z = self.w
        self.w = (self.w ^ js_unsigned_right_shift(self.w, 19)) ^ (t ^ js_unsigned_right_shift(t, 8))
        r = abs(self.w)
        return min + (r % (max + 1 - min))
