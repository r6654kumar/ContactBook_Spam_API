import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from "sequelize";
import { User, Contact, SpamReport } from '../models/index.js';

// Route to register a new user
export const register = async (req, res) => {
  const { phone_number, name, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);

  try {
    const user = await User.create({ phone_number, name, password: hashedPassword, email });
    const token = jwt.sign({ id: user.id },process.env.JWT_SECTET_TOKEN);
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send({ error: 'Phone number already registered' });
  }
};

//Login route for user
export const login = async (req, res) => {
  const { phone_number, password } = req.body;
  const user = await User.findOne({ where: { phone_number } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ error: 'Invalid login credentials' });
  }

  const token = jwt.sign({ id: user.id },process.env.JWT_SECTET_TOKEN);
  console.log("Token",token)
  res.send({ user, token });
};

// adding a new contact
export const addContact = async (req, res) => {
  const { name, phone_number } = req.body;
  const userId = req.user.id;

  const contact = await Contact.create({ name, phone_number, userId });
  res.status(201).send(contact);
};

//reporting a number spam
export const reportSpam = async (req, res) => {
  const { phone_number } = req.body;
  const reported_by = req.user.id;

  const spamReport = await SpamReport.create({ phone_number, reported_by });
  res.status(201).send(spamReport);
};

// Route to search for a person
export const search = async (req, res) => {
  const { name, phone_number } = req.query;
   try {
    if (phone_number) {     //Searching a person through phone number
      const registeredUser = await User.findOne({    //checking if the phone number being searched is in the Users table.....
        where: { phone_number },
      });

      if (registeredUser) {
        // Checking  if the user performing the search is in the registered user's contact list
        const isInContactList = await Contact.findOne({
          where: { userId: registeredUser.id, phone_number: req.user.phone_number },
        });

        // Return registered user's details
        const result = {
          name: registeredUser.name,
          phone_number: registeredUser.phone_number,
          spam_likelihood: await calculateSpamLikelihood(registeredUser.phone_number),
          email: isInContactList ? registeredUser.email : null, //  person’s email is only displayed if the person is a registered user and the user who is searching is in the person’s contact list
        };
        return res.send([result]);
      } else {
        // If no registered user, finding all contacts with this phone number
        const contacts = await Contact.findAll({ where: { phone_number } });
        if (contacts.length === 0) {
          return res.status(404).send({ error: 'No results found' });
        }
        const results = await Promise.all(
          contacts.map(async (contact) => ({
            name: contact.name,
            phone_number: contact.phone_number,
            spam_likelihood: await calculateSpamLikelihood(contact.phone_number),
          }))
        );

        return res.send(results);
      }
    }

    if (name) {
      // first show people whose names start with the search query
      const startMatches = await Contact.findAll({
        where: {
          name: {
            [Op.like]: `${name}%`,
          },
        },
      });
  // people whose names contain but don’t start with the search query
      const containMatches = await Contact.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`,
            [Op.notLike]: `${name}%`,
          },
        },
      });

      // Combine both sets of results
      const results = await Promise.all(
        [...startMatches, ...containMatches].map(async (contact) => ({
          name: contact.name,
          phone_number: contact.phone_number,
          spam_likelihood: await calculateSpamLikelihood(contact.phone_number),
        }))
      );

      return res.send(results);
    }

    res.status(400).send({ error: 'Provide name/ phone number' });

  } catch (error) {
    res.status(500).send({ error: 'Error' });
  }
};

// logic to calculate spam likelihood
const calculateSpamLikelihood = async (phone_number) => {
  const spamReports = await SpamReport.count({ where: { phone_number } });
  return spamReports > 10 ? 'High' : spamReports > 5 ? 'Medium' : 'Low';
};