; prints "Hello, world!" and halts
    .orig $3000
    lea   r0, myStr
    halt

myStr:        .stringz "Hello, world!"
