;;; in.asm
;;; IN service routine (system call)
;;; adapted from Figure 9.4, Patt & Patel

        .orig   0x04a0
start:  st      r7, SaveR7      ; Save the linkage back to the program.
        st      r1, SaveR1      ; Save the values in the registers
        st      r2, SaveR2      ; that are used so that they
        st      r3, SaveR3      ; can be restored before RET

        ld      r2, nl
l1:     ldi     r3, CRTSR       ; Check CRTDR -- is it free?
        brzp    l1
        sti     r2, CRTDR       ; Move the cursor to new clean line

        lea     r1, Prompt      ; Load address of prompt string
loop:   ldr     r0, r1, #0      ; Get next prompt character
        brz     input           ; Check for end of prompt string
l2:     ldi     r3, CRTSR
        brzp    l2
        sti     r0, CRTDR       ; Write next character of prompt string
        add     r1, r1, #1      ; Increment Prompt pointer
        brnzp   loop

input:  ldi     r3, KBSR        ; Has a character been typed?
        brzp    input
        ldi     r0, KBDR        ; Load it into R0
l3:     ldi     r3, CRTSR
        brzp    l3
        sti     r0, CRTDR       ; Echo input character

l4:     ldi     r3, CRTSR
        brzp    l4
        sti     r2, CRTDR       ; Move cursor to new clean line
        ld      r1, SaveR1
        ld      r2, SaveR2
        ld      r3, SaveR3
        ld      r7, SaveR7
        ret

;;; constants
SaveR7: .fill   0x0000
SaveR1: .fill   0x0000
SaveR2: .fill   0x0000
SaveR3: .fill   0x0000
CRTSR:  .fill   0xf3fc
CRTDR:  .fill   0xf3ff
KBSR:   .fill   0xf400
KBDR:   .fill   0xf401
nl:     .fill   0x000A          ; newline ASCII code
Prompt: .stringz        "Input a character>"
        .end
