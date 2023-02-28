const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.likeSauce = (req, res, next) => { 
    Sauce.findOne({_id: req.params.id})
       .then((sauce) => { 
                            console.log('test');
console.log(sauce);
                            console.log(req.body.like);

                            console.log(sauce.usersDisliked.indexOf(req.params.userId));
            switch (req.body.like){
                case 1:
                    if (sauce.usersDisliked.indexOf(req.body.userId) !== -1){
                        //sauce.usersDisliked.find(req.body.userId) !== undefined)
                        console.log("if");
                        Sauce.updateOne({ _id: req.params.id}, { 
                            likes: likes += 1, 
                            usersLiked: usersLiked.push(req.body.userId),
                            usersDisliked: usersDisliked.filter(id => id !== req.body.userId),
                            dislikes: dislikes -= 1})
                        .then(() => res.status(200).json({message : 'like ajouté!'}))
                        .catch(error => res.status(401).json({ error }));
                    }else{
                        console.log('else');
                        Sauce.updateOne({ _id: req.params.id}, { 
                            likes: sauce.likes += 1, 
                            usersLiked: usersLiked.push(`${req.body.userId}`)})
                        .then(() => res.status(200).json({message : 'like ajouté!'}))
                        .catch(error => res.status(401).json({ error }));
                    }
                break;
                case 0:
                    console.log("okay 0");
                    if(usersLiked.indexOf(req.params.userId) !== -1){
                        Sauce.updateOne({_id: req.params.id}, {
                            likes: likes -=1,
                            usersLiked: usersLiked.filter(id => id !== req.params.userId)})
                        .then(() => res.status(200).json({message : 'like retiré!'}))
                        .catch(error => res.status(401).json({ error }));
                    }else{
                        Sauce.updateOne({_id: req.params.id}, {
                            dislikes: dislikes -=1,
                            usersDisliked: usersDisliked.filter(id => id !== req.params.userId)})
                        .then(() => res.status(200).json({message : 'dislike retiré!'}))
                        .catch(error => res.status(401).json({ error }));
                    }
                break;
                case -1:
                    console.log("okay -1");
                    if (usersLiked.indexOf(req.params.userId) !== -1){
                        Sauce.updateOne({ _id: req.params.id}, { 
                            usersLiked: usersLiked.filter(id => id !== req.params.userId),
                            likes: likes -= 1,
                            dislikes: dislikes += 1, 
                            usersDisliked: usersDisliked.push(`${req.params.userId}`)})
                        .then(() => res.status(200).json({message : 'dislike ajouté!'}))
                        .catch(error => res.status(401).json({ error }));
                    }else{
                        Sauce.updateOne({ _id: req.params.id}, { 
                            dislikes: dislikes += 1, 
                            usersDisliked: usersDisliked.push(`${req.params.userId}`)})
                        .then(() => res.status(200).json({message : 'dislike ajouté!'}))
                        .catch(error => res.status(401).json({ error }));
                    }
                break;
            }
        })
       .catch((error) => {
           res.status(400).json({ error });
       });
};

exports.createSauce = (req, res, next) => {
   const sauceObject = JSON.parse(req.body.sauce);
   delete sauceObject._id;
   delete sauceObject._userId;
   const sauce = new Sauce({
       ...sauceObject,
       likes: req.likes || 0,
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });
 
   sauce.save()
   .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
   .catch(error => { res.status(400).json( { error })})
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
   const sauceObject = req.file ? {
       ...JSON.parse(req.body.sauce),
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
 
   delete sauceObject._userId;
   Sauce.findOne({_id: req.params.id})
       .then((sauce) => {
           if (sauce.userId != req.auth.userId) {
               res.status(401).json({ message : 'Not authorized'});
           } else {
               Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Objet modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(400).json({ error });
       });
};

exports.deleteSauce = (req, res, next) => {
   Sauce.findOne({ _id: req.params.id})
       .then(sauce => {
           if (sauce.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = sauce.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Sauce.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};