Empress is still in early development and new features to add are currently being explored. If you would like to suggest
something you can email kcantrel@ucsd.edu.

# Installation
Please install the following packages in order to run Empress

```
conda create -n empress pip tornado
source activate empress
conda install -c conda-forge scikit-bio
pip install git+https://github.com/biocore/empress.git
```

# Run
Type the following commands in the terminal for more information

```
empress --help
```

A bit of preprocessing occurs after empress is ran. The following message will appear in the terminal when empress is ready
to be used. 

```
build web server
server started at port 8080
```

Then enter the following in a browsers search bar to launch empress.

```
http://localhost:8080/
```

# Input Formats
Empress takes in as input a Newick file for the tree and a tabular mapping file for the feature metadata.

An example of a feature metadata file would look like something as follows

```
ID           Genome_size     Phyla
OTU_1001     100000          Proteobacteria
OTU_1002     150201          Firmicutes
OTU_2001     502051          Actinobacteria
```
The first column of the metadata files must match the ids in the newick file. In the above example ID is what
the newick file would use to name the nodes..
If a node does not have a name in the newick file, empress will assign it "yid" where id is a number corresponding to its
position in the tree.
Note: to make processing metadata easier, empress will remane the first column of the metadata file to Node_id. So in the 
above example, ID will show up as Node_id in empress.

# To run sample data set
To download sample data enter the following in terminal or go into data/primates and manually download the files.

```
svn export https://github.com/biocore/empress.git/trunk/data
```

Both leaf_metadata.txt and internal_node_metadata.txt are space delimited. To make combining the metadata files easier,
empress will rename #SequenceID will show up as Node_id in empress.

Here is an exmple of how internal_node_metadata.txt if formatted.

```
Node_id Intercept_effect_size   Phyl_Group[T.Lemur]_effect_size ...
y0  0.02256030930979693 -0.12709112380267737 ...
y1  -0.15122058716686135    0.1629544435889327 ...
.
.
.
```

To run empress type the following command from within the directory where you downloaded the data file

```
empress --tree-file tree.nwk --metadata leaf_metadata.txt --additional-metadata internal_node_metadata.txt --clade-field Node_id --main-seperator " " --additional-seperator " "
```
--clade-field is what empress will use in its "clade color" feature. Node_id was choosen to better demonstrate this feature.

Note: It doesn't matter which metadata is passed in as metadata and which one is passed in as additional-metadata 

After a couple of seconds the following will display in the terminal.

```
build web server
server started at port 8080
```

Open up a browser and type the following into the search bar.

```
http://localhost:8080/
```
After you should see

![Alt text](images/greeting_screen.png?raw=true)

# Hiding Metadata
To hide metadata go to the metadata tab and unselect the checkbox. You can then press the metadata tab again to make the menu transparent. In future releases, the ability to save the metadata table to a file will be available.

# Selecting Branches
To select parts of the tree hold down the shift key and move the mouse around the part of the tree you want to select. This will
find the lowest common ancestor of the nodes within the select box and color that subtree green.
![Alt text](images/selected_tree.png?raw=true)
Once you select a part of the tree, the corresponding metadata will show in the metadata table. Once you select a part of the tree you
can then collapse the selected part or click anywhere on the canvas to unselect the tree. Collapsing the subtree will create a
triangle whose side lengths are equal to the longest branch/sortest branch and edge lie on the left/right most branch of the select
subtree.
![Alt text](images/collapsed_selected_tree.png?raw=true)

# Highlighting tips/internal branches
To color tips, select the 'Highlight Tips' tab. Then select the feature from the metedata you wish to use and the color. Next, enter a
value you wish to search for in one of the text boxes. The 'Lower Bound' is used to to highlight all tips that have a value greater
than the value entered in the box. For example, say you have a species count feature in your metadata. If you enter 5 in the 'Lower 
Bound'. 'Upper Bound is the same as 'Lower Bound' expect it will color all tips whose value is less than the one entered in the text box. 'Equals to' will match all tips whose value matches the one in the text box. 
The examlpe below uses colors all 
all tips that have species count greater than 5 will be colored. 
