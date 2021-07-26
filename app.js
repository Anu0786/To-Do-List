//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');


mongoose.connect("mongodb+srv://admin-Anurag:atlas123@cluster0.spcwi.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Welcome to the to-do list" });
const item2 = new Item({ name: "+ to Add new Item" });
const item3 = new Item({ name: "- to remove item" });

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {
    Item.find({}, function(err, founditems) {
        if (founditems.length == 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err)
                    console.log(err);
                else
                    console.log("Saved ")
            });
            res.redirect("/");
        } else
            res.render("list", { listTitle: "Today", newListItems: founditems });
    })
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                res.redirect("/" + customListName);
                list.save();
            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    });
});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });


    if (listName == "Today") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({ name: listName }, function(err, foundList) {

            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }




    // if (req.body.list === "Work") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // }
});

app.post("/delete", function(req, res) {
    const checkedItemId = (req.body.checkbox);
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId, function(err) {
            if (!err) {
                console.log("Successfully Deleted Checked Item.")
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }


})

app.get("/work", function(req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server started on port 3000");
});