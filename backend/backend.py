from flask import Flask
from flask import jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os.path
from verify_test import verify_proof
from flask_cors import CORS, cross_origin
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
# Allow CORS from any origin on all routes
CORS(app, origins=["http://localhost:5173"])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.sqlite')

db = SQLAlchemy(app)

class Review(db.Model):
    __tablename__ = 'review'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)
    rating = db.Column(db.Float)
    recommend = db.Column(db.Boolean)
    grade = db.Column(db.Text)
    professor_name = db.Column(db.Text)
    class_name = db.Column(db.Text)
    major = db.Column(db.Text)
    proof = db.Column(db.Text)

    def __str__(self):
        return str(review_serialize(self))


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
        if not data: return

        arg_dict = {
            arg_name: data.get(arg_name, None) for arg_name in [
                "text",
                "rating",
                "recommend",
                "grade",
                "professor_name",
                "class_name",
                "major",
                "proof"
            ]
        }

        null_flag = "NOT_USED"
        grade, major = arg_dict["grade"], arg_dict["major"]
        if grade == null_flag:
            if major == null_flag:
                vk = 0
            else:
                vk = 1
        else:
            if major == null_flag:
                vk = 2
            else:
                vk = 3
            
        
        proof = arg_dict["proof"]
        if not proof or not verify_proof(proof, vk):
            return

        try: arg_dict["rating"] = float(arg_dict["rating"]) 
        except: arg_dict["rating"] = 1.0

        arg_dict["recommend"] = True if arg_dict["recommend"] in ["true", "True"] else False
        
        review = Review(**arg_dict)
        db.session.add(review)
        db.session.commit()
        return jsonify({'message': 'Review added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/read_reviews', methods = ['GET'])
@cross_origin(origin='http://localhost:5173')
def read_reviews():
    reviews = db.session.query(Review).all()
    return jsonify([review_serialize(r) for r in reviews])


if __name__ == '__main__':
    if not os.path.exists("data.sqlite"):
        with app.app_context(): 
            db.create_all()      
    app.run(debug=True, port=5003)