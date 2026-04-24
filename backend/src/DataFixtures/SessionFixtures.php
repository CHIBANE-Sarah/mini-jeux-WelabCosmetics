<?php

namespace App\DataFixtures;

use App\Entity\Game;
use App\Entity\Session;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class SessionFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        /** @var User $admin */
        $admin = $this->getReference('user_admin', User::class);

        // Session 1 — Mots Croisés uniquement
        $session1 = new Session();
        $session1->setTitreSession('Mots Croisés Cosmétiques');
        $session1->setCodeSession('SESS01');
        $session1->setDuree(900); // 15 minutes en secondes
        $session1->setCreateur($admin);

        $game1 = new Game();
        $game1->setType(Game::TYPE_CROSSWORD);
        $game1->setSession($session1);
        $session1->addGame($game1);

        $manager->persist($session1);
        $manager->persist($game1);
        $this->addReference('session_1', $session1);

        // Session 2 — Association uniquement
        $session2 = new Session();
        $session2->setTitreSession('Association Termes & Définitions');
        $session2->setCodeSession('SESS02');
        $session2->setDuree(600); // 10 minutes en secondes
        $session2->setCreateur($admin);

        $game2 = new Game();
        $game2->setType(Game::TYPE_ASSOCIATION);
        $game2->setSession($session2);
        $session2->addGame($game2);

        $manager->persist($session2);
        $manager->persist($game2);
        $this->addReference('session_2', $session2);

        // Session 3 — Formulation uniquement
        $session3 = new Session();
        $session3->setTitreSession('Formulation de Produits');
        $session3->setCodeSession('SESS03');
        $session3->setDuree(1200); // 20 minutes en secondes
        $session3->setCreateur($admin);

        $game3 = new Game();
        $game3->setType(Game::TYPE_FORMULATION);
        $game3->setSession($session3);
        $session3->addGame($game3);

        $manager->persist($session3);
        $manager->persist($game3);
        $this->addReference('session_3', $session3);

        // Session 4 — Les 3 jeux (session complète pour tester le parcours joueur)
        $session4 = new Session();
        $session4->setTitreSession('Formation Cosmétique Complète');
        $session4->setCodeSession('LAB2026');
        $session4->setDuree(2700); // 45 minutes en secondes
        $session4->setCreateur($admin);

        $game4a = new Game();
        $game4a->setType(Game::TYPE_ASSOCIATION);
        $game4a->setSession($session4);
        $session4->addGame($game4a);

        $game4b = new Game();
        $game4b->setType(Game::TYPE_CROSSWORD);
        $game4b->setSession($session4);
        $session4->addGame($game4b);

        $game4c = new Game();
        $game4c->setType(Game::TYPE_FORMULATION);
        $game4c->setSession($session4);
        $session4->addGame($game4c);

        $manager->persist($session4);
        $manager->persist($game4a);
        $manager->persist($game4b);
        $manager->persist($game4c);
        $this->addReference('session_4', $session4);

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [UserFixtures::class];
    }
}