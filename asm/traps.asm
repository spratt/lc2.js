;;; traps.asm
;;; Sets up the interrupt service routines (system calls)

        ;; fill all traps with the halt routine
        .orig 0x20              ; traps go from 0x20 to 0xff, 0xe0 traps total
        .blkw 0xe0, 0xfd70      ; halt address

        ;; fill standard traps with addresses of their routines
        .orig   0x20
        .fill   0x0400          ; 0x20, getc
        .fill   0x0430          ; 0x21, out
        .fill   0x0450          ; 0x22, puts
        .fill   0x04a0          ; 0x23, in
