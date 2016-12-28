;;; halt.asm
;;; HALT service routine (system call)
;;; adapted from Figure 9.6, Patt & Patel

        .orig   0xfd70
        st      r7, SaveR7      ; Save linkage back to program
        st      r0, SaveR0
        st      r1, SaveR1

;;; Print message that the machine is halting

        ld      r0, nl
        out
        lea     r0, msg
        puts
        ld      r0, nl
        out

;;; clear bit at $FFFF to stop the machine

        ldi     r1, MCR
        ld      r0, MASK
        and     r0, r1, r0      ; clear top bit
        sti     r0, MCR

;;; return from HALT routine
;;; Should never happen.

        ld      r0, SaveR0
        ld      r1, SaveR1
        ld      r7, SaveR7
        ret

nl:     .fill   0x000a          ; ASCII newline
SaveR0: .fill   0x0000
SaveR1: .fill   0x0000
SaveR7: .fill   0x0000
msg:    .stringz        "Halting the machine."
MCR:    .fill   0xffff
MASK:   .fill   0x7fff
        .end
