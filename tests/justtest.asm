START:  nop
        br START
        brn START
        brp START
        brnz START
        brzp START
        brnzp START
        jmpr r5, #5
        jsr #5
        jsrr r5, #5
        ld r5, #5
        ldi r5, #5
        not r5, r7
        st r5, #5
        sti r5, #5
        trap #5
        ret
        rti
        .fill #5
        .stringz "Hello, world!"
        .end
        nop
