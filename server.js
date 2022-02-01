let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
// const { parse } = require('path');

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'content-type');
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.listen(9090, () => {
	console.log('WebServer funcionando na porta 9090...');
});

app.get('/livros', (req, res) => {
	fs.readFile('books.json', 'utf8', (err, data) => {
		if (err) {
			let response = { status: 'Erro!', result: err };
			res.json(response);
		} else {
			let obj = JSON.parse(data);
			let result = 'Nenhum livro encontrado.';

			if (obj) {
				result = obj.books;
			}

			let response = { status: 'Sucesso!', result: result };
			res.json(response);
		}
	});
});

app.get('/livros/:id', (req, res) => {
	let paramId = req.params.id;

	if (isNumeric(paramId)) {
		fs.readFile('books.json', 'utf8', (err, data) => {
			if (err) {
				let response = { status: 'Erro!', result: err };
				res.json(response);
			} else {
				let obj = JSON.parse(data);
				let result = 'Nenhum livro encontrado com esse ID.';

				if (obj) {
					for (const key in obj.books) {
						if (obj.books[key].book_id == paramId) {
							result = obj.books[key];
						}
					}
				}

				let response = { status: 'Sucesso!', result: result };
				res.json(response);
			}
		});
	} else {
		let response = {
			status: 'Erro!',
			result: 'Parâmetro ID inválido. O ID deve ser um número inteiro.',
		};
		res.json(response);
	}
});

app.post('/livros', (req, res) => {
	let body = req.body;

	let resp = '';

	if (
		isNumeric(body.book_id) &&
		isBool(body.available) &&
		titleFilled(body.title) &&
		authorFilled(body.author)
	) {
		fs.readFile('books.json', 'utf8', (err, data) => {
			if (err) {
				let response = { status: 'Erro!', result: err };
				res.json(response);
			} else {
				let obj = JSON.parse(data);
				let register = true;

				for (const key in obj.books) {
					if (obj.books[key].book_id == body.book_id) {
						register = false;
						resp = 'Esse número de ID já está registrado.';
					}
				}

				if (register) {
					let newBook = {};

					newBook.book_id = body.book_id;
					newBook.title = body.title;
					newBook.author = body.author;
					newBook.available = body.available;

					obj.books.push(newBook);
					fs.writeFile('books.json', JSON.stringify(obj), (err) => {
						if (err) {
							let response = { status: 'Erro!', result: err };
							res.json(response);
						} else {
							let response = { status: 'Sucesso!', result: 'Livro incluído.' };
							res.json(response);
						}
					});
				} else {
					let response = { status: 'Erro!', result: resp };
					res.json(response);
					console.log('Livro NÃO incluído. ', resp);
				}
			}
		});
	} else {
		resp =
			'Os campos: book_id, title, author e available devem OBRIGATÓRIAMENTE estar preenchidos! Sendo que o Campo ID deve ser um número inteiro e o campo available ser true ou false. Por favor verifique sua requisição.';

		let response = { status: 'Erro!', result: resp };
		res.json(response);
	}
});

app.put('/livros', (req, res) => {
	let body = req.body;

	if (
		isNumeric(body.book_id) &&
		isBool(body.available) &&
		titleFilled(body.title) &&
		authorFilled(body.author)
	) {
		fs.readFile('books.json', 'utf8', (err, data) => {
			if (err) {
				let response = { status: 'Erro!', result: err };
				res.json(response);
			} else {
				let obj = JSON.parse(data);
				let exist = false;

				let book_id = body.book_id;
				let title = body.title;
				let author = body.author;
				let available = body.available;

				console.log(
					`ID: ${book_id} | Title : ${title} | Author: ${author} | Available : ${available}`
				);

				for (const key in obj.books) {
					if (obj.books[key].book_id == body.book_id) {
						exist = true;

						obj.books[key].title = title;
						obj.books[key].author = author;
						obj.books[key].available = available;
					}
				}

				if (!exist) {
					const book = {};

					book.book_id = book_id;
					book.title = title;
					book.author = author;
					book.available = available;

					obj.books.push(book);
				}

				fs.writeFile('books.json', JSON.stringify(obj), (err) => {
					if (err) {
						let response = { status: 'Erro!', result: err };
						res.json(response);
					} else {
						let response = {
							status: 'Sucesso!',
							result: 'Livro alterado ou inserido com sucesso.',
						};
						res.json(response);
					}
				});
			}
		});
	} else {
		let resp =
			'Os campos: book_id, title, author e available devem OBRIGATÓRIAMENTE estar preenchidos! Sendo que o Campo ID deve ser um número inteiro e o campo available ser true ou false. Por favor verifique sua requisição.';

		let response = { status: 'Erro!', result: resp };
		res.json(response);
	}
});

app.delete('/livros/:id', (req, res) => {
	let book_id = req.params.id;

	if (isNumeric(book_id)) {
		fs.readFile('books.json', 'utf8', (err, data) => {
			if (err) {
				let response = { status: 'Erro!', result: err };
				res.json(response);
			} else {
				let obj = JSON.parse(data);
				let changed = false;

				for (const key in obj.books) {
					if (obj.books[key].book_id == book_id) {
						delete obj.books[key];
						changed = true;
					}
				}

				if (changed) {
					const newBooks = [];

					for (const key in obj.books) {
						if (obj.books[key]) {
							newBooks.push(obj.books[key]);
						}
					}

					obj.books = newBooks;

					fs.writeFile('books.json', JSON.stringify(obj), (err) => {
						if (err) {
							let response = { status: 'Erro!', result: err };
							res.json(response);
						} else {
							let response = {
								status: 'Sucesso!',
								result: 'Registro apagado com sucesso.',
							};
							res.json(response);
						}
					});
				} else {
					let response = {
						status: 'Erro!',
						result: 'Esse ID não existe.',
					};
					res.json(response);
				}
			}
		});
	} else {
		let response = {
			status: 'Erro!',
			result: 'Parâmetro ID inválido. ID deve ser um número inteiro.',
		};
		res.json(response);
	}
});

function isNumeric(str) {
	let regex = /^[0-9]+$/;
	return regex.test(str);
}

function isBool(str) {
	if (str) {
		let value = str.toLowerCase();
		return value == 'true' || value == 'false' ? true : false;
	} else {
		return false;
	}
}

function titleFilled(str) {
	return str && str != '' ? true : false;
}

function authorFilled(str) {
	return str && str != '' ? true : false;
}
