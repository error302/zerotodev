-- Insert Phase 1, Lesson 1
INSERT INTO lessons (id, phase, order_index, title, slug, content_mdx, xp_reward)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001', 1, 1, 'Memory Allocation in C', 'memory-allocation-c', 'To truly understand how computers work, you must understand memory. High-level languages like Python or JavaScript hide this from you. In this lesson, you will drop down to C to manipulate memory directly. We will build a simple version of `malloc`.', 100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, lesson_id, title, instructions, starter_code, language, xp_reward)
VALUES (
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Build Simple Malloc', 'Implement the `simple_malloc` function. It must return a pointer to the current offset in the `heap` array, and then advance the offset by the requested size. Do not worry about freeing memory for now.', '#include <stdio.h>\n#include <stddef.h>\n\n#define HEAP_SIZE 1024\nchar heap[HEAP_SIZE];\nsize_t current_offset = 0;\n\nvoid* simple_malloc(size_t size) {\n    // Your code here\n    return NULL;\n}\n\nint main() {\n    int* ptr1 = (int*)simple_malloc(sizeof(int));\n    if (ptr1 == NULL) {\n        printf("Failed to allocate\\n");\n        return 1;\n    }\n    *ptr1 = 42;\n    printf("Value: %d\\n", *ptr1);\n    return 0;\n}', 'c', 50
) ON CONFLICT (id) DO NOTHING;

INSERT INTO hints (exercise_id, level, content, xp_cost)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', 1, 'You need to return a pointer. `heap` is an array, so `&heap[current_offset]` or `heap + current_offset` gives you the address.', 5),
    ('660e8400-e29b-41d4-a716-446655440001', 2, 'Before returning the address, calculate it and store it in a variable. Then, add `size` to `current_offset`. Finally, return the address.', 10),
    ('660e8400-e29b-41d4-a716-446655440001', 3, 'void* ptr = &heap[current_offset]; current_offset += size; return ptr;', 20);

INSERT INTO test_cases (exercise_id, input, expected_output, feedback_on_fail, is_hidden)
VALUES (
    '660e8400-e29b-41d4-a716-446655440001', '', 'Value: 42', 'Your function either returned NULL or calculated the pointer incorrectly. Make sure you return the correct address from the heap array and update the current_offset.', FALSE
);

-- Insert Phase 1, Lesson 2
INSERT INTO lessons (id, phase, order_index, title, slug, content_mdx, xp_reward)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002', 1, 2, 'Linked Lists in Memory', 'linked-lists-c', 'Arrays are contiguous blocks of memory, but Linked Lists consist of independent nodes connected via pointers. Let us build a simple Linked List in C.', 100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, lesson_id, title, instructions, starter_code, language, xp_reward)
VALUES (
    '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Append to Linked List', 'Implement the `append` function to add a new node to the end of the linked list.', '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int data;\n    struct Node* next;\n} Node;\n\nvoid append(Node** head_ref, int new_data) {\n    // 1. Allocate node\n    // 2. Put in the data\n    // 3. Make next of new node as NULL\n    // 4. If the Linked List is empty, then make the new node as head\n    // 5. Else traverse till the last node\n    // 6. Change the next of last node\n}\n\nint main() {\n    Node* head = NULL;\n    append(&head, 1);\n    append(&head, 2);\n    append(&head, 3);\n    \n    Node* temp = head;\n    while(temp != NULL) {\n        printf("%d ", temp->data);\n        temp = temp->next;\n    }\n    return 0;\n}', 'c', 75
) ON CONFLICT (id) DO NOTHING;

INSERT INTO hints (exercise_id, level, content, xp_cost)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440002', 1, 'Use `malloc(sizeof(Node))` to allocate the new node.', 5),
    ('660e8400-e29b-41d4-a716-446655440002', 2, 'To traverse, use a temporary pointer: `Node* last = *head_ref; while (last->next != NULL) last = last->next;`', 15);

INSERT INTO test_cases (exercise_id, input, expected_output, feedback_on_fail, is_hidden)
VALUES (
    '660e8400-e29b-41d4-a716-446655440002', '', '1 2 3', 'Make sure your append function handles both empty and non-empty lists correctly.', FALSE
);

-- Insert Phase 1, Lesson 3
INSERT INTO lessons (id, phase, order_index, title, slug, content_mdx, xp_reward)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003', 1, 3, 'Hex Dumper: Viewing Raw Memory', 'hex-dumper-c', 'To debug memory and binaries, you need to see exactly what bytes are stored. A hex dumper reads raw memory and prints it in hexadecimal format.', 150
) ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, lesson_id, title, instructions, starter_code, language, xp_reward)
VALUES (
    '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Build a Hex Viewer', 'Implement the `dump_hex` function. It should take a pointer to memory and a size, and print each byte in two-digit hexadecimal format separated by a space.', '#include <stdio.h>\n\nvoid dump_hex(const void* data, size_t size) {\n    const unsigned char* p = (const unsigned char*)data;\n    // Iterate through size bytes and print %02x\n}\n\nint main() {\n    char str[] = "DEV";\n    dump_hex(str, 3);\n    return 0;\n}', 'c', 100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (exercise_id, input, expected_output, feedback_on_fail, is_hidden)
VALUES (
    '660e8400-e29b-41d4-a716-446655440003', '', '44 45 56', 'Remember that ASCII D is 44, E is 45, V is 56 in hex.', FALSE
);

-- Insert Phase 1, Lesson 4
INSERT INTO lessons (id, phase, order_index, title, slug, content_mdx, xp_reward)
VALUES (
    '550e8400-e29b-41d4-a716-446655440004', 1, 4, 'Algorithmic Complexity: QuickSort', 'quicksort-c', 'Now that you understand memory, lets manipulate it efficiently. QuickSort is an in-place sorting algorithm that relies heavily on pointer manipulation and recursion.', 200
) ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, lesson_id, title, instructions, starter_code, language, xp_reward)
VALUES (
    '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Implement QuickSort Partition', 'Implement the `partition` logic for QuickSort that places the pivot in its correct position and moves smaller elements to the left.', '#include <stdio.h>\n\nvoid swap(int* a, int* b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint partition(int arr[], int low, int high) {\n    int pivot = arr[high];\n    int i = (low - 1);\n    // Implement partitioning logic here\n    // Return the partitioning index\n    return 0;\n}\n\nvoid quicksort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quicksort(arr, low, pi - 1);\n        quicksort(arr, pi + 1, high);\n    }\n}\n\nint main() {\n    int arr[] = {10, 7, 8, 9, 1, 5};\n    quicksort(arr, 0, 5);\n    for(int i=0; i<6; i++) printf("%d ", arr[i]);\n    return 0;\n}', 'c', 150
) ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (exercise_id, input, expected_output, feedback_on_fail, is_hidden)
VALUES (
    '660e8400-e29b-41d4-a716-446655440004', '', '1 5 7 8 9 10', 'Ensure your partition loop runs from low to high-1 and swaps correctly.', FALSE
);
