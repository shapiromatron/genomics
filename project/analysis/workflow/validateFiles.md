# http://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/FOOTER
================================================================
========   validateFiles   ====================================
================================================================
validateFiles - Validates the format of different genomic files.
                Exits with a zero status for no errors detected and non-zero for errors.
                Uses filename 'stdin' to read from stdin.
                Automatically decompresses Files in .gz, .bz2, .zip, .Z format.
                Accepts multiple input files of the same type.
                Writes Error messages to stderr
usage:
   validateFiles -chromInfo=FILE -options -type=FILE_TYPE file1 [file2 [...]]

   -type=
       fasta        : Fasta files (only one line of sequence, and no quality scores)
       fastq        : Fasta with quality scores (see http://maq.sourceforge.net/fastq.shtml)
       csfasta      : Colorspace fasta (implies -colorSpace)
       csqual       : Colorspace quality (see link below)
                      See http://marketing.appliedbiosystems.com/mk/submit/SOLID_KNOWLEDGE_RD?_JS=T&rd=dm
       bam          : Binary Alignment/Map
                      See http://samtools.sourceforge.net/SAM1.pdf
       bigWig       : Big Wig
                      See http://genome.ucsc.edu/goldenPath/help/bigWig.html
       bedN[+P]     : BED N or BED N+ or BED N+P
                      where N is a number between 3 and 15 of standard BED columns,
                      optional + indicates the presence of additional columns
                      and P is the number of addtional columns
                      Examples: -type=bed6 or -type=bed6+ or -type=bed6+3
                      See http://genome.ucsc.edu/FAQ/FAQformat.html#format1
       bigBedN[+P]  : bigBED N  or bigBED N+ or bigBED N+P, similar to BED
                      See http://genome.ucsc.edu/goldenPath/help/bigBed.html
       tagAlign     : Alignment files, replaced with BAM
       pairedTagAlign
       broadPeak    : ENCODE Peak formats
       narrowPeak     These are specialized bedN+P formats.
       gappedPeak     See http://genomewiki.cse.ucsc.edu/EncodeDCC/index.php/File_Formats
       bedGraph    :  BED Graph
       rcc         :  NanoString RCC
       idat        :  Illumina IDAT

   -as=fields.as                If you have extra "bedPlus" fields, it's great to put a definition
                                of each field in a row in AutoSql format here. Applies to bed-related types.
   -tab                         If set, expect fields to be tab separated, normally
                                expects white space separator. Applies to bed-related types.
   -chromDb=db                  Specify DB containing chromInfo table to validate chrom names
                                and sizes
   -chromInfo=file.txt          Specify chromInfo file to validate chrom names and sizes
   -colorSpace                  Sequences include colorspace values [0-3] (can be used
                                with formats such as tagAlign and pairedTagAlign)
   -isSorted                    Input is sorted by chrom, only affects types tagAlign and pairedTagAlign
   -doReport                    Output report in filename.report
   -version                     Print version

For Alignment validations
   -genome=path/to/hg18.2bit    REQUIRED to validate sequence mappings match the genome specified
                                in the .2bit file. (BAM, tagAlign, pairedTagAlign)
   -nMatch                      N's do not count as a mismatch
   -matchFirst=n                Only check the first N bases of the sequence
   -mismatches=n                Maximum number of mismatches in sequence (or read pair)
   -mismatchTotalQuality=n      Maximum total quality score at mismatching positions
   -mmPerPair                   Check either pair dont exceed mismatch count if validating
                                  pairedTagAlign files (default is the total for the pair)
   -mmCheckOneInN=n             Check mismatches in only one in 'n' lines (default=1, all)
   -allowOther                  Allow chromosomes that aren't native in BAM's
   -allowBadLength              Allow chromosomes that have the wrong length in BAM
   -complementMinus             Complement the query sequence on the minus strand (for testing BAM)
   -bamPercent=N.N              Percentage of BAM alignments that must be compliant
   -privateData                 Private data so empty sequence is tolerated
