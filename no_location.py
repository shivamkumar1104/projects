import phonenumbers
from phonenumbers import carrier, geocoder


phone1 = phonenumbers.parse("+916204980241")
phone2 = phonenumbers.parse("+447493056960")
print("\n Phone number location\n")
print(geocoder.description_for_number(phone1,"en"))
print(geocoder.description_for_number(phone2,"en"))