;;; puts.asm
;;; PUTS service routine (system call)
;;; adapted from Figure 9.8, Patt & Patel

        .orig   0x0450

;;; save registers
        st      r7, SaveR7
        st      r0, SaveR0
        st      r1, SaveR1
        st      r3, SaveR3

;;; loop through each character in the array
loop:   ldr     r1, r0, #0
        brz     return
l2:     ldi     r3, CRTSR
        brzp    l2
        sti     r1, CRTDR
        add     r0, r0, #1
        brnzp   loop

;;; restore registers and return
return: ld      r0, SaveR0
        ld      r1, SaveR1
        ld      r3, SaveR3
        ld      r7, SaveR7
        ret

;;; constants
CRTSR:  .fill   0xf3fc
CRTDR:  .fill   0xf3ff
SaveR0: .fill   0x0000
SaveR1: .fill   0x0000
SaveR3: .fill   0x0000
SaveR7: .fill   0x0000
        .end
