;;; out.asm
;;; OUT service routine (system call)
;;; adapted from Figure 9.5, Patt & Patel

        .orig   0x0430
        st      r7, SaveR7      ; Save linkage back to the program
        st      r1, SaveR1      ; Save register value to restore at end

;;; Write the character
ChkRdy: ldi     r1, CRTSR
        brzp    ChkRdy
        sti     r0, CRTDR

;;; Return from trap
        ld      r1, SaveR1
        ld      r7, SaveR7
        ret

CRTSR:  .fill   0xf3fc
CRTDR:  .fill   0xf3ff
SaveR1: .fill   0x0000
SaveR7: .fill   0x0000
        .end
        
