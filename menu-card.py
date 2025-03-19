
PROJECT 1

menu = {
    'Pizza': 35,
    'Coffee': 100,
    'Burger':50,
    'Fries': 20,
    'Salad': 20,
    'Pasta': 50,
    
    
}
# Grretings
print("welcome to my restaurant")
print("Pizza: Rs35\nPasta: Rs50\nBurger: Rs50\nFries: Rs20\nSalad: Rs20\nCoffee: Rs100")

order_total = 0
item_1 = input("enter the name of item you wish to order: ")
if item_1 in menu:
    order_total +=menu[item_1]
    print(f"Your item {item_1} has been ordered")
    
else:
      print(f"Ordered item {item_1} is not available yet")
    
    
another_order = input("Do you want to add another item? (Yes/No)" )
if another_order == "Yes":
    item_2 = input("do you want to order something else = ")
    if item_2 in menu:
         order_total += menu[item_2]
         print(f"your item {item_2} has been ordered")
    else:
         print(f"ordered item{item_2} is not available")
         
         print(f"the total amount of items is {order_total}")



