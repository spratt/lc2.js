        .orig   $3000
        ld r0, myStr
        sti r0, outAddr
        halt
myStr:  .stringz "H"
outAddr: .fill $f3ff
