;;; getc.asm
;;; GETC service routine (system call)
        
        .orig   0x0400
        
;;; save registers
        st      r7, SaveR7
        st      r3, SaveR3

;;; get character
input:  ldi     r3, KBSR        ; Has a character been typed?
        brzp    input
        ldi     r0, KBDR        ; Load it into R0

;;; restore registers and return
        ld      r3, SaveR3
        ld      r7, SaveR7
        ret
        
;;; constants
SaveR7: .fill   0x0000
SaveR3: .fill   0x0000
KBSR:   .fill   0xf400
KBDR:   .fill   0xf401
        .end
