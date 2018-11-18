-- Seed data with a fake user for testing (password: a)
insert into users (name, email, entries, joined) values ('Angga', 'angga.aw92@gmail.com', 5, '2018-01-01');
insert into login (password, email) values ('$2a$10$WAK21U0LWl7C//jJ.DOB2uPP1DJQh7KUDgasdyQeGzkop2Pzl8W7u', 'angga.aw92@gmail.com');