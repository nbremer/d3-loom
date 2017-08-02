# safe
lebab --replace loom.js --transform arrow
lebab --replace loom.js --transform for-of
lebab --replace loom.js --transform for-each
lebab --replace loom.js --transform arg-rest
lebab --replace loom.js --transform arg-spread
lebab --replace loom.js --transform obj-method
lebab --replace loom.js --transform obj-shorthand
lebab --replace loom.js --transform multi-var
# unsafe
lebab --replace loom.js --transform let
lebab --replace loom.js --transform template