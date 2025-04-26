from flask import Flask
from flask import jsonify, request, json
from flask_sqlalchemy import SQLAlchemy
import os.path
# from flask_cors import CORS
basedir = os.path.abspath(os.path.dirname(__file__))
from trees import Tree

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.sqlite')


test_tree = Tree(None)


db = SQLAlchemy(app)

class Review(db.Model):
    __tablename__ = 'review'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)
    rating = db.Column(db.Float) # bool
    recommend = db.Column(db.Boolean)
    grade = db.Column(db.Text)
    professor_name = db.Column(db.Text)
    class_name = db.Column(db.Text)
    major = db.Column(db.Text)

    def __str__(self):
        return str(review_serialize(self), indent=4)


def review_serialize(review):
    return {
        'text': review.text,
        'rating': str(review.rating),
        'recommend': str(review.recommend),
        'grade': review.grade,
        'professor_name': review.professor_name,
        'class_name': review.class_name,
        "major": review.major
    }


@app.route('/')
def sample():
    reviews = db.session.query(Review).all()
    return jsonify([review_serialize(r) for r in reviews])

@app.route('/write_review', methods = ['POST'])
def write_review():
    # Verify proof 
    try:
        data = request.get_json(silent=True)
        if data is None:
            data = request.form.to_dict()
        arg_dict = {
            arg_name: data.get(arg_name) for arg_name in [
                "text",
                "rating",
                "recommend",
                "grade",
                "professor_name",
                "class_name",
                "major"
            ]
        }
        try: arg_dict["rating"] = float(arg_dict["rating"]) 
        except: arg_dict["rating"] = 1.0

        arg_dict["recommend"] = True if arg_dict["recommend"] == "true" else False
        
        review = Review(**arg_dict)
        db.session.add(review)
        db.session.commit()
        return jsonify({'message': 'Review added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/read_reviews', methods = ['GET'])
def read_reviews():
    
    pass


if __name__ == '__main__':
    with app.app_context():  # Needed for DB operations
        db.create_all()      # Creates the database and tables
    app.run(debug=True)