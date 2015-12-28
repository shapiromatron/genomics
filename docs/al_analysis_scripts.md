
generate_matrix.py
-
generate_matrix.py creates a tab-delimited matrix file over genomic features specified in a BED file considering genomic data in a bigWig file. The script allows for user-specified custom bins and considers strandedness.

---
Usage with an unstranded bigWig file:

    python generate_matrix.py [Options] <bigWig> <Feature list BED> <Output file>

Usage with paired, stranded bigWig files:

    python generate_matrix.py [Options] --stranded_bigwigs <Forward bigWig> <Reverse bigWig> <Feature list BED> <Output file>

Options:

    --anchor/-a <center/start/end>
Determines where relative to a BED-file entry to anchor the generated matrix. 'center' specifies the middle of the range, while 'start' and 'end' specify the beginning and end of the range while respecting strandedness. Default: -a 'center'.

    --bin_start/-b <int>
    --bin_number/-n <int>
    --bin_size/-s <int>
Specifies the dimensions and number of bins in the generated matrix.  'bin_start' gives the starting position of the first bin relative to the anchor position. 'bin_number' gives the number of bins used. 'bin_size' specifies the size of the bins. Default: -b -2500 -n 50 -s 100.

    --stranded_bigwigs
Indicates use of paired, stranded bigWigs. When used, the script expects two bigWig files, first the forward strand and then the reverse strand. Default: False.

    --stranded_bed
Indicates use of a stranded BED file.  When used, the script orients in genetic space, i.e. relatively downstream positions have larger values. When used with stranded_bigwigs, the generated matrix considers only coverage on the same strand.  Default: False.

    --opposite_strand <file name>
Writes an opposite strand matrix file with the specified name.  Requires stranded_bed. Default: False.

Sample usage:

    python generate_matrix.py --stranded_bed wgEncodeBroadHistoneA549CtcfEtoh02Sig.bigWig unt1hr.obsTSS.bed sample_output_matrix.txt

> Written with [StackEdit](https://stackedit.io/).