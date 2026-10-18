/**
 * Original code snippets for Code Mode across 7 languages.
 * At least 10 snippets per language, 8-20 lines each.
 */
import { CodeLanguage } from '@/types';

export interface CodeSnippet {
  id: string;
  language: CodeLanguage;
  code: string;
}

export const CODE_SNIPPETS: Record<CodeLanguage, string[]> = {
  "javascript": [
    "function debounce(fn, delay) {\n  let timer = null;\n  return function (...args) {\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}",
    "function deepClone(obj) {\n  if (obj === null || typeof obj !== 'object') {\n    return obj;\n  }\n  const copy = Array.isArray(obj) ? [] : {};\n  for (const key of Object.keys(obj)) {\n    copy[key] = deepClone(obj[key]);\n  }\n  return copy;\n}",
    "function flattenArray(arr, depth = 1) {\n  return depth > 0\n    ? arr.reduce((acc, val) =>\n        acc.concat(Array.isArray(val) ? flattenArray(val, depth - 1) : val),\n      [])\n    : arr.slice();\n}",
    "async function fetchWithRetry(url, options = {}, retries = 3) {\n  try {\n    const res = await fetch(url, options);\n    if (!res.ok) throw new Error(res.statusText);\n    return await res.json();\n  } catch (err) {\n    if (retries <= 1) throw err;\n    return fetchWithRetry(url, options, retries - 1);\n  }\n}",
    "function memoize(fn) {\n  const cache = new Map();\n  return function (arg) {\n    if (cache.has(arg)) {\n      return cache.get(arg);\n    }\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n}",
    "function pipe(...functions) {\n  return (initialValue) => {\n    return functions.reduce((acc, fn) => {\n      return fn(acc);\n    }, initialValue);\n  };\n}",
    "class EventEmitter {\n  constructor() {\n    this.events = new Map();\n  }\n  on(event, listener) {\n    if (!this.events.has(event)) this.events.set(event, []);\n    this.events.get(event).push(listener);\n  }\n  emit(event, ...args) {\n    const listeners = this.events.get(event) || [];\n    listeners.forEach((fn) => fn(...args));\n  }\n}",
    "function chunk(array, size = 1) {\n  const chunks = [];\n  for (let i = 0; i < array.length; i += size) {\n    chunks.push(array.slice(i, i + size));\n  }\n  return chunks;\n}",
    "function parseQueryString(qs) {\n  const params = new URLSearchParams(qs);\n  const result = {};\n  for (const [key, value] of params.entries()) {\n    result[key] = value;\n  }\n  return result;\n}",
    "function throttle(fn, limit) {\n  let inThrottle = false;\n  return function (...args) {\n    if (!inThrottle) {\n      fn.apply(this, args);\n      inThrottle = true;\n      setTimeout(() => (inThrottle = false), limit);\n    }\n  };\n}"
  ],
  "typescript": [
    "interface CacheEntry<T> {\n  value: T;\n  expiresAt: number;\n}\nclass MemoryCache<T> {\n  private store = new Map<string, CacheEntry<T>>();\n  set(key: string, value: T, ttlMs: number): void {\n    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });\n  }\n  get(key: string): T | null {\n    const item = this.store.get(key);\n    if (!item || Date.now() > item.expiresAt) return null;\n    return item.value;\n  }\n}",
    "type Result<T, E = Error> =\n  | { ok: true; data: T }\n  | { ok: false; error: E };\nfunction safeExecute<T>(fn: () => T): Result<T> {\n  try {\n    return { ok: true, data: fn() };\n  } catch (err) {\n    return { ok: false, error: err as Error };\n  }\n}",
    "interface TreeNode<T> {\n  value: T;\n  left?: TreeNode<T>;\n  right?: TreeNode<T>;\n}\nfunction inorderTraversal<T>(root?: TreeNode<T>): T[] {\n  if (!root) return [];\n  return [\n    ...inorderTraversal(root.left),\n    root.value,\n    ...inorderTraversal(root.right),\n  ];\n}",
    "type ReadonlyDeep<T> = {\n  readonly [P in keyof T]: T[P] extends object\n    ? ReadonlyDeep<T[P]>\n    : T[P];\n};\nfunction freezeConfig<T extends object>(cfg: T): ReadonlyDeep<T> {\n  return Object.freeze({ ...cfg }) as ReadonlyDeep<T>;\n}",
    "interface Task<T> {\n  id: string;\n  run: () => Promise<T>;\n}\nasync function runBatch<T>(tasks: Task<T>[]): Promise<T[]> {\n  const results: T[] = [];\n  for (const task of tasks) {\n    results.push(await task.run());\n  }\n  return results;\n}",
    "type EventMap = Record<string, unknown>;\ninterface TypedBus<M extends EventMap> {\n  publish<K extends keyof M>(event: K, payload: M[K]): void;\n  subscribe<K extends keyof M>(event: K, handler: (p: M[K]) => void): () => void;\n}",
    "function assertNever(x: never): never {\n  throw new Error('Unexpected value: ' + JSON.stringify(x));\n}\ntype Shape = { kind: 'circle'; r: number } | { kind: 'square'; size: number };\nfunction area(s: Shape): number {\n  switch (s.kind) {\n    case 'circle': return Math.PI * s.r * s.r;\n    case 'square': return s.size * s.size;\n    default: return assertNever(s);\n  }\n}",
    "interface RateLimiterOptions {\n  maxRequests: number;\n  windowMs: number;\n}\nclass TokenBucket {\n  private tokens: number;\n  constructor(private opts: RateLimiterOptions) {\n    this.tokens = opts.maxRequests;\n  }\n  consume(): boolean {\n    if (this.tokens <= 0) return false;\n    this.tokens--;\n    return true;\n  }\n}",
    "function clamp(val: number, min: number, max: number): number {\n  if (val < min) return min;\n  if (val > max) return max;\n  return val;\n}",
    "interface MetricPoint {\n  timestamp: number;\n  value: number;\n}\nfunction movingAverage(points: MetricPoint[], windowSize: number): number[] {\n  return points.map((_, idx, arr) => {\n    const slice = arr.slice(Math.max(0, idx - windowSize + 1), idx + 1);\n    const sum = slice.reduce((acc, p) => acc + p.value, 0);\n    return sum / slice.length;\n  });\n}"
  ],
  "python": [
    "def binary_search(arr: list[int], target: int) -> int:\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
    "from collections import deque\ndef breadth_first_search(graph, start):\n    visited = set([start])\n    queue = deque([start])\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return order",
    "def quick_sort(items: list) -> list:\n    if len(items) <= 1:\n        return items\n    pivot = items[len(items) // 2]\n    left = [x for x in items if x < pivot]\n    middle = [x for x in items if x == pivot]\n    right = [x for x in items if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)",
    "import time\nfrom functools import wraps\ndef measure_time(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        duration = time.perf_counter() - start\n        print(f\"{func.__name__} took {duration:.4f}s\")\n        return result\n    return wrapper",
    "class Stack:\n    def __init__(self):\n        self._items = []\n    def push(self, val):\n        self._items.append(val)\n    def pop(self):\n        if not self._items:\n            raise IndexError(\"Stack is empty\")\n        return self._items.pop()\n    def is_empty(self):\n        return len(self._items) == 0",
    "def find_duplicates(numbers: list[int]) -> list[int]:\n    seen = set()\n    duplicates = set()\n    for num in numbers:\n        if num in seen:\n            duplicates.add(num)\n        else:\n            seen.add(num)\n    return sorted(list(duplicates))",
    "import json\ndef read_json_records(filepath: str) -> list[dict]:\n    try:\n        with open(filepath, 'r', encoding='utf-8') as fh:\n            return json.load(fh)\n    except (FileNotFoundError, json.JSONDecodeError) as exc:\n        print(f\"Error loading records: {exc}\")\n        return []",
    "def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        prev = merged[-1]\n        if current[0] <= prev[1]:\n            prev[1] = max(prev[1], current[1])\n        else:\n            merged.append(current)\n    return merged",
    "def count_word_frequencies(text: str) -> dict[str, int]:\n    counts = {}\n    words = text.lower().split()\n    for word in words:\n        clean = word.strip(\".,!?;:()[]\")\n        if clean:\n            counts[clean] = counts.get(clean, 0) + 1\n    return counts",
    "class SimpleLRU:\n    def __init__(self, capacity: int = 128):\n        self.capacity = capacity\n        self.cache = {}\n        self.usage = []\n    def get(self, key):\n        if key in self.cache:\n            self.usage.remove(key)\n            self.usage.append(key)\n            return self.cache[key]\n        return None"
  ],
  "htmlcss": [
    "<div class=\"card-container\">\n  <header class=\"card-header\">\n    <h2 class=\"title\">System Metrics</h2>\n    <span class=\"badge status-active\">Online</span>\n  </header>\n  <main class=\"card-body\">\n    <p class=\"description\">Live latency and throughput telemetry.</p>\n  </main>\n</div>",
    ".modal-overlay {\n  position: fixed;\n  inset: 0;\n  background-color: rgba(11, 17, 24, 0.85);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 50;\n  backdrop-filter: blur(4px);\n}",
    "<nav class=\"navbar\">\n  <a href=\"/\" class=\"brand-logo\">KeyFlow</a>\n  <ul class=\"nav-links\">\n    <li><a href=\"#test\">Practice</a></li>\n    <li><a href=\"#lessons\">Learn</a></li>\n    <li><a href=\"#stats\">History</a></li>\n  </ul>\n</nav>",
    ".button-solid {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.5rem 1rem;\n  font-family: inherit;\n  font-size: 0.875rem;\n  border-radius: 0.375rem;\n  background-color: #121c24;\n  color: #3dd6c6;\n  border: 1px solid #1c2b36;\n}",
    "<form class=\"input-form\" onsubmit=\"return false;\">\n  <label for=\"speed-goal\" class=\"label-heading\">Daily Goal</label>\n  <input type=\"number\" id=\"speed-goal\" class=\"text-input\" min=\"1\" max=\"60\" />\n  <button type=\"submit\" class=\"btn-primary\">Save Target</button>\n</form>",
    ".grid-layout {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: 1.5rem;\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n}",
    "<table class=\"data-table\">\n  <thead>\n    <tr>\n      <th>Rank</th>\n      <th>User</th>\n      <th>WPM</th>\n      <th>Accuracy</th>\n    </tr>\n  </thead>\n  <tbody></tbody>\n</table>",
    ".toast-notification {\n  position: fixed;\n  bottom: 1.5rem;\n  right: 1.5rem;\n  background-color: #121c24;\n  border: 1px solid #3dd6c6;\n  padding: 0.75rem 1.25rem;\n  border-radius: 6px;\n}",
    "<section class=\"hero-banner\">\n  <h1 class=\"hero-title\">Velocity Meets Precision</h1>\n  <p class=\"hero-subtitle\">Mechanical keyboard speed engine.</p>\n  <div class=\"cta-group\">\n    <a href=\"#start\" class=\"btn-cta\">Start Test</a>\n  </div>\n</section>",
    ".stat-badge {\n  display: inline-block;\n  padding: 0.25rem 0.5rem;\n  font-size: 0.75rem;\n  font-family: monospace;\n  border-radius: 4px;\n  background: #0f1821;\n  color: #94a3b8;\n}"
  ],
  "cpp": [
    "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nvoid bubbleSort(std::vector<int>& list) {\n    bool swapped = true;\n    while (swapped) {\n        swapped = false;\n        for (size_t i = 0; i + 1 < list.size(); ++i) {\n            if (list[i] > list[i + 1]) {\n                std::swap(list[i], list[i + 1]);\n                swapped = true;\n            }\n        }\n    }\n}",
    "#include <string>\n#include <memory>\n\nclass KeyNode {\npublic:\n    char keyChar;\n    std::shared_ptr<KeyNode> next;\n    KeyNode(char c) : keyChar(c), next(nullptr) {}\n    bool hasNext() const { return next != nullptr; }\n};",
    "#include <unordered_map>\n#include <string>\n\nint countFrequency(const std::string& input, char target) {\n    int count = 0;\n    for (char ch : input) {\n        if (ch == target) {\n            count++;\n        }\n    }\n    return count;\n}",
    "#include <chrono>\n\nclass BenchmarkTimer {\n    std::chrono::high_resolution_clock::time_point start;\npublic:\n    BenchmarkTimer() : start(std::chrono::high_resolution_clock::now()) {}\n    double stopMs() const {\n        auto end = std::chrono::high_resolution_clock::now();\n        return std::chrono::duration<double, std::milli>(end - start).count();\n    }\n};",
    "#include <numeric>\n#include <vector>\n\ndouble computeMean(const std::vector<double>& values) {\n    if (values.empty()) return 0.0;\n    double sum = std::accumulate(values.begin(), values.end(), 0.0);\n    return sum / static_cast<double>(values.size());\n}",
    "#include <stdexcept>\n\ntemplate <typename T>\nclass SimpleRingBuffer {\n    T buffer[64];\n    size_t head = 0;\n    size_t count = 0;\npublic:\n    void push(const T& item) {\n        buffer[head] = item;\n        head = (head + 1) % 64;\n        if (count < 64) count++;\n    }\n};",
    "#include <utility>\n\nlong long fibonacciIterative(int n) {\n    if (n <= 1) return n;\n    long long a = 0, b = 1;\n    for (int i = 2; i <= n; ++i) {\n        long long next = a + b;\n        a = b;\n        b = next;\n    }\n    return b;\n}",
    "#include <cmath>\n\nbool isPrime(int num) {\n    if (num <= 1) return false;\n    if (num <= 3) return true;\n    if (num % 2 == 0 || num % 3 == 0) return false;\n    for (int i = 5; i * i <= num; i += 6) {\n        if (num % i == 0 || num % (i + 2) == 0) return false;\n    }\n    return true;\n}",
    "#include <string>\n#include <sstream>\n\nstd::string intToHex(int value) {\n    std::stringstream stream;\n    stream << std::hex << value;\n    return stream.str();\n}",
    "#include <vector>\n\nvoid reverseVector(std::vector<int>& vec) {\n    size_t left = 0;\n    size_t right = vec.size() > 0 ? vec.size() - 1 : 0;\n    while (left < right) {\n        int tmp = vec[left];\n        vec[left] = vec[right];\n        vec[right] = tmp;\n        left++;\n        right--;\n    }\n}"
  ],
  "java": [
    "public class BinaryTree {\n    static class Node {\n        int key;\n        Node left, right;\n        Node(int val) { this.key = val; }\n    }\n    public static boolean search(Node root, int val) {\n        if (root == null) return false;\n        if (root.key == val) return true;\n        return val < root.key ? search(root.left, val) : search(root.right, val);\n    }\n}",
    "import java.util.*;\npublic class FrequencyCounter {\n    public static Map<String, Integer> tally(List<String> words) {\n        Map<String, Integer> map = new HashMap<>();\n        for (String w : words) {\n            map.put(w, map.getOrDefault(w, 0) + 1);\n        }\n        return map;\n    }\n}",
    "public class ArrayStats {\n    public static double computeVariance(int[] numbers) {\n        if (numbers.length == 0) return 0.0;\n        double sum = 0;\n        for (int n : numbers) sum += n;\n        double mean = sum / numbers.length;\n        double var = 0;\n        for (int n : numbers) var += Math.pow(n - mean, 2);\n        return var / numbers.length;\n    }\n}",
    "public class StringReverser {\n    public static String reverseWords(String sentence) {\n        String[] parts = sentence.split(\" \");\n        StringBuilder sb = new StringBuilder();\n        for (int i = parts.length - 1; i >= 0; i--) {\n            sb.append(parts[i]);\n            if (i > 0) sb.append(\" \");\n        }\n        return sb.toString();\n    }\n}",
    "import java.util.concurrent.atomic.AtomicInteger;\npublic class SequenceIdGenerator {\n    private final AtomicInteger counter = new AtomicInteger(1000);\n    public int nextId() {\n        return counter.getAndIncrement();\n    }\n    public int current() {\n        return counter.get();\n    }\n}",
    "public class MatrixMath {\n    public static int[][] multiply(int[][] a, int[][] b) {\n        int rows = a.length, cols = b[0].length, common = b.length;\n        int[][] out = new int[rows][cols];\n        for (int i = 0; i < rows; i++) {\n            for (int j = 0; j < cols; j++) {\n                for (int k = 0; k < common; k++) out[i][j] += a[i][k] * b[k][j];\n            }\n        }\n        return out;\n    }\n}",
    "public class PalindromeChecker {\n    public static boolean isPalindrome(String str) {\n        int left = 0, right = str.length() - 1;\n        while (left < right) {\n            if (str.charAt(left) != str.charAt(right)) return false;\n            left++; right--;\n        }\n        return true;\n    }\n}",
    "import java.util.ArrayList;\npublic class CustomList<E> {\n    private final ArrayList<E> elements = new ArrayList<>();\n    public void add(E element) { elements.add(element); }\n    public E get(int index) { return elements.get(index); }\n    public int size() { return elements.size(); }\n}",
    "public class FactorialCalculator {\n    public static long compute(int n) {\n        if (n < 0) throw new IllegalArgumentException(\"Negative input\");\n        long res = 1;\n        for (int i = 2; i <= n; i++) res *= i;\n        return res;\n    }\n}",
    "public class Clamper {\n    public static int clamp(int val, int low, int high) {\n        if (val < low) return low;\n        if (val > high) return high;\n        return val;\n    }\n}"
  ],
  "sql": [
    "SELECT u.id, u.username, COUNT(t.id) AS total_tests\nFROM users u\nLEFT JOIN typing_tests t ON u.id = t.user_id\nWHERE t.completed_at >= NOW() - INTERVAL '30 days'\nGROUP BY u.id, u.username\nHAVING COUNT(t.id) >= 10\nORDER BY total_tests DESC;",
    "CREATE TABLE test_sessions (\n    id VARCHAR(64) PRIMARY KEY,\n    user_id VARCHAR(64) NOT NULL,\n    net_wpm INT NOT NULL,\n    accuracy NUMERIC(5,2) NOT NULL,\n    elapsed_sec INT NOT NULL,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);",
    "UPDATE user_profiles\nSET best_wpm = GREATEST(best_wpm, 115),\n    updated_at = CURRENT_TIMESTAMP\nWHERE user_id = 'usr_9824'\n  AND is_active = TRUE;",
    "SELECT date_trunc('day', created_at) AS session_date,\n       AVG(net_wpm) AS average_wpm,\n       COUNT(*) AS session_count\nFROM test_sessions\nWHERE created_at >= CURRENT_DATE - INTERVAL '14 days'\nGROUP BY session_date\nORDER BY session_date ASC;",
    "INSERT INTO streak_records (user_id, streak_days, last_practice_date)\nVALUES ('usr_77', 5, CURRENT_DATE)\nON CONFLICT (user_id)\nDO UPDATE SET\n    streak_days = streak_records.streak_days + 1,\n    last_practice_date = EXCLUDED.last_practice_date;",
    "SELECT item_name, quantity, unit_price,\n       (quantity * unit_price) AS subtotal\nFROM inventory_items\nWHERE in_stock = TRUE\nORDER BY subtotal DESC\nLIMIT 25;",
    "WITH ranked_scores AS (\n    SELECT user_id, net_wpm,\n           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY net_wpm DESC) as rk\n    FROM test_sessions\n)\nSELECT user_id, net_wpm AS top_score\nFROM ranked_scores\nWHERE rk = 1;",
    "CREATE INDEX idx_sessions_user_date\nON test_sessions (user_id, created_at DESC);",
    "SELECT t.mode, AVG(t.net_wpm) as avg_speed, MAX(t.net_wpm) as peak_speed\nFROM test_sessions t\nWHERE t.status = 'completed'\nGROUP BY t.mode\nORDER BY avg_speed DESC;",
    "DELETE FROM temporary_logs\nWHERE expiry_timestamp < CURRENT_TIMESTAMP\n  AND archived = TRUE;"
  ]
};

export function getRandomCodeSnippet(lang: CodeLanguage = 'typescript'): string {
  const list = CODE_SNIPPETS[lang] || CODE_SNIPPETS.typescript;
  return list[Math.floor(Math.random() * list.length)];
}
